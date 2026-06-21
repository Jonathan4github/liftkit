import { Injectable } from '@nestjs/common';
import {
  GeneratedVariant,
  ProductSnapshot,
  VariantGenerator,
} from './variant-generator.interface';

const round2 = (n: number) => Math.round(n * 100) / 100;

type Strategy = (base: ProductSnapshot) => GeneratedVariant;

const STRATEGIES: Strategy[] = [
  (b) => ({
    title: `${b.title} - Limited Stock`,
    description: `${b.description} Selling fast - only a few left at this price.`,
    price: round2(b.price * 1.05),
    rationale: 'Scarcity framing: urgency and a small price lift to test willingness to pay.',
  }),
  (b) => ({
    title: `${b.title} (Customer Favorite)`,
    description: `Loved by thousands of happy customers. ${b.description}`,
    price: b.price,
    rationale: 'Social proof: lead with popularity to build trust at the same price.',
  }),
  (b) => ({
    title: `${b.title} - Best Value`,
    description: `${b.description} Get more for less today.`,
    price: round2(b.price * 0.95 - 0.01),
    rationale: 'Value framing: a small discount with a charm price ending to lift conversion.',
  }),
  (b) => ({
    title: `Premium ${b.title}`,
    description: `Crafted for those who want the best. ${b.description}`,
    price: round2(b.price * 1.15),
    rationale: 'Premium positioning: higher price to test a quality-seeking segment.',
  }),
  (b) => ({
    title: `${b.title} - Free Shipping`,
    description: `${b.description} Ships free, no minimum.`,
    price: b.price,
    rationale: 'Offer framing: a shipping perk to reduce checkout hesitation.',
  }),
];

@Injectable()
export class FakeVariantGenerator implements VariantGenerator {
  generate(base: ProductSnapshot, count: number): Promise<GeneratedVariant[]> {
    const n = Math.max(1, Math.min(count, STRATEGIES.length));
    return Promise.resolve(STRATEGIES.slice(0, n).map((strategy) => strategy(base)));
  }
}
