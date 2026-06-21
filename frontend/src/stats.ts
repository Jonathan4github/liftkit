import type { VariantStat } from './api';

// Standard normal CDF (matches the backend's significance helper).
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const upper = 1 - p;
  return z >= 0 ? upper : 1 - upper;
}

// Probability (0..1) that a challenger's add-to-cart rate beats the control's.
export function probabilityBeatsControl(
  control: VariantStat,
  challenger: VariantStat,
): number {
  const c1 = control.addToCarts;
  const n1 = control.views;
  const c2 = challenger.addToCarts;
  const n2 = challenger.views;
  if (!n1 || !n2) return 0;

  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return p2 > p1 ? 1 : 0;
  return normalCdf((p2 - p1) / se);
}

// Relative improvement of a variant's conversion vs the control's.
export function improvementVsControl(
  control: VariantStat,
  variant: VariantStat,
): number | null {
  if (control.conversionRate === 0) return null;
  return (variant.conversionRate - control.conversionRate) / control.conversionRate;
}