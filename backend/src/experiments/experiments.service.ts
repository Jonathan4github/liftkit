import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import {
  VARIANT_GENERATOR,
  type VariantGenerator,
} from '../ai/variant-generator.interface';
import { twoProportionZTest } from '../stats/significance';

const MIN_VIEWS_PER_VARIANT = 100;
const SIGNIFICANCE_ALPHA = 0.05;
const CHALLENGERS_PER_GENERATION = 3;

@Injectable()
export class ExperimentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VARIANT_GENERATOR)
    private readonly generator: VariantGenerator,
  ) {}

  async start(merchantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, merchantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const running = await this.prisma.experiment.findFirst({
      where: { productId, status: 'running' },
    });
    if (running) {
      throw new ConflictException('Product already has a running experiment');
    }

    return this.prisma.experiment.create({
      data: {
        productId,
        variants: {
          create: {
            title: product.title,
            description: product.description,
            price: product.price,
            isControl: true,
            rationale: 'Original product (control)',
          },
        },
      },
      include: { variants: true },
    });
  }

  async findAllForProduct(merchantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, merchantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.experiment.findMany({
      where: { productId },
      orderBy: { generation: 'desc' },
      include: { variants: true },
    });
  }

  async findOne(merchantId: string, id: string) {
    const experiment = await this.prisma.experiment.findFirst({
      where: { id, product: { merchantId } },
      include: { variants: true },
    });
    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }
    return experiment;
  }

  async addVariant(
    merchantId: string,
    experimentId: string,
    dto: CreateVariantDto,
  ) {
    const experiment = await this.prisma.experiment.findFirst({
      where: { id: experimentId, product: { merchantId } },
    });
    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }
    if (experiment.status !== 'running') {
      throw new ConflictException('Experiment is not running');
    }

    return this.prisma.variant.create({
      data: { ...dto, experimentId, isControl: false },
    });
  }

  async generate(merchantId: string, experimentId: string, count: number) {
    const experiment = await this.prisma.experiment.findFirst({
      where: { id: experimentId, product: { merchantId } },
      include: { variants: true },
    });
    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }
    if (experiment.status !== 'running') {
      throw new ConflictException('Experiment is not running');
    }

    const control =
      experiment.variants.find((v) => v.isControl) ?? experiment.variants[0];
    if (!control) {
      throw new ConflictException('Experiment has no control variant');
    }

    const generated = await this.generator.generate(
      {
        title: control.title,
        description: control.description,
        price: Number(control.price),
      },
      count,
    );

    await this.prisma.variant.createMany({
      data: generated.map((g) => ({ ...g, experimentId, isControl: false })),
    });

    return this.findOne(merchantId, experimentId);
  }

  async stats(merchantId: string, experimentId: string) {
    const experiment = await this.findOne(merchantId, experimentId);
    const { variants, significance } = await this.computeStats(experiment);
    return {
      experimentId: experiment.id,
      status: experiment.status,
      generation: experiment.generation,
      variants,
      significance,
    };
  }

  async evaluate(merchantId: string, experimentId: string) {
    const experiment = await this.findOne(merchantId, experimentId);
    if (experiment.status !== 'running') {
      throw new ConflictException('Experiment is not running');
    }

    const { variants, significance } = await this.computeStats(experiment);

    if (!significance || !significance.isSignificant) {
      const reason = !significance
        ? 'Need a control and at least one challenger to compare'
        : !significance.enoughData
          ? 'Not enough views yet to decide'
          : 'No challenger significantly beats the control yet';
      return { promoted: false, reason, significance, variants };
    }

    const winner = experiment.variants.find(
      (v) => v.id === significance.bestChallengerId,
    );
    if (!winner) {
      throw new ConflictException('Winner variant not found');
    }

    await this.prisma.experiment.update({
      where: { id: experiment.id },
      data: { status: 'finished' },
    });

    const nextExperiment = await this.prisma.experiment.create({
      data: {
        productId: experiment.productId,
        generation: experiment.generation + 1,
        variants: {
          create: {
            title: winner.title,
            description: winner.description,
            price: winner.price,
            isControl: true,
            rationale: `Promoted winner from generation ${experiment.generation}`,
          },
        },
      },
    });

    const generated = await this.generator.generate(
      {
        title: winner.title,
        description: winner.description,
        price: Number(winner.price),
      },
      CHALLENGERS_PER_GENERATION,
    );
    await this.prisma.variant.createMany({
      data: generated.map((g) => ({
        ...g,
        experimentId: nextExperiment.id,
        isControl: false,
      })),
    });

    return {
      promoted: true,
      winner: { id: winner.id, title: winner.title },
      finishedExperimentId: experiment.id,
      newExperiment: await this.findOne(merchantId, nextExperiment.id),
      significance,
    };
  }

  private async computeStats(experiment: {
    variants: Array<{ id: string; title: string; isControl: boolean }>;
  }) {
    const variantIds = experiment.variants.map((v) => v.id);
    const grouped = await this.prisma.event.groupBy({
      by: ['variantId', 'type'],
      where: { variantId: { in: variantIds } },
      _count: { _all: true },
    });

    const counts = new Map<
      string,
      { view: number; click: number; add_to_cart: number }
    >();
    for (const id of variantIds) {
      counts.set(id, { view: 0, click: 0, add_to_cart: 0 });
    }
    for (const row of grouped) {
      const c = counts.get(row.variantId);
      if (c) {
        c[row.type] = row._count._all;
      }
    }

    const variants = experiment.variants.map((v) => {
      const c = counts.get(v.id)!;
      const conversionRate = c.view ? c.add_to_cart / c.view : 0;
      return {
        id: v.id,
        title: v.title,
        isControl: v.isControl,
        views: c.view,
        clicks: c.click,
        addToCarts: c.add_to_cart,
        conversionRate,
      };
    });

    const control = variants.find((v) => v.isControl);
    const challengers = variants.filter((v) => !v.isControl);
    const best = challengers.reduce<(typeof challengers)[number] | null>(
      (top, v) =>
        top === null || v.conversionRate > top.conversionRate ? v : top,
      null,
    );

    let significance: {
      controlId: string;
      bestChallengerId: string;
      zScore: number;
      pValue: number;
      uplift: number;
      enoughData: boolean;
      isSignificant: boolean;
    } | null = null;

    if (control && best) {
      const test = twoProportionZTest(
        { conversions: control.addToCarts, total: control.views },
        { conversions: best.addToCarts, total: best.views },
      );
      const enoughData =
        control.views >= MIN_VIEWS_PER_VARIANT &&
        best.views >= MIN_VIEWS_PER_VARIANT;
      significance = {
        controlId: control.id,
        bestChallengerId: best.id,
        zScore: test.z,
        pValue: test.pValue,
        uplift: test.uplift,
        enoughData,
        isSignificant:
          enoughData &&
          test.pValue < SIGNIFICANCE_ALPHA &&
          best.conversionRate > control.conversionRate,
      };
    }

    return { variants, significance };
  }
}
