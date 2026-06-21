import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EventTypeValue } from './dto/record-event.dto';

// Stable FNV-1a hash so the same visitor is always assigned the same variant.
function hashToIndex(key: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(productId: string, visitorId?: string) {
    const vid = visitorId ?? randomUUID();

    const experiment = await this.prisma.experiment.findFirst({
      where: { productId, status: 'running' },
      include: { variants: { orderBy: { createdAt: 'asc' } } },
    });
    if (!experiment || experiment.variants.length === 0) {
      throw new NotFoundException('No running experiment for this product');
    }

    const index = hashToIndex(`${vid}:${experiment.id}`, experiment.variants.length);
    const variant = experiment.variants[index];

    return { visitorId: vid, experimentId: experiment.id, variant };
  }

  async recordEvent(
    variantId: string,
    visitorId: string,
    type: EventTypeValue,
  ) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.prisma.event.create({
      data: { variantId, visitorId, type },
    });

    return { recorded: true };
  }
}