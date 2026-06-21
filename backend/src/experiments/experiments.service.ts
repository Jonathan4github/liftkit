import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
