// Standard normal CDF (Abramowitz & Stegun 26.2.17 approximation).
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const upper = 1 - p;
  return z >= 0 ? upper : 1 - upper;
}

export interface Proportion {
  conversions: number;
  total: number;
}

export interface ZTestResult {
  z: number;
  pValue: number; // one-sided: probability the challenger is NOT actually better
  uplift: number; // relative improvement of challenger over control
}

// One-sided two-proportion z-test: is the challenger's rate higher than control's?
export function twoProportionZTest(
  control: Proportion,
  challenger: Proportion,
): ZTestResult {
  const { conversions: c1, total: n1 } = control;
  const { conversions: c2, total: n2 } = challenger;
  if (n1 === 0 || n2 === 0) {
    return { z: 0, pValue: 1, uplift: 0 };
  }

  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = se === 0 ? 0 : (p2 - p1) / se;
  const pValue = 1 - normalCdf(z);
  const uplift = p1 === 0 ? 0 : (p2 - p1) / p1;

  return { z, pValue, uplift };
}