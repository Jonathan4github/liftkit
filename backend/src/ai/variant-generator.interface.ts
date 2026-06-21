export interface ProductSnapshot {
  title: string;
  description: string;
  price: number;
}

export interface GeneratedVariant {
  title: string;
  description: string;
  price: number;
  rationale: string;
}

export interface VariantGenerator {
  generate(base: ProductSnapshot, count: number): Promise<GeneratedVariant[]>;
}

export const VARIANT_GENERATOR = Symbol('VARIANT_GENERATOR');
