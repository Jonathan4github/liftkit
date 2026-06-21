import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Experiment, type Product } from '../api';

type ExpWithProduct = Experiment & { productTitle: string };

interface RunningRow {
  exp: ExpWithProduct;
  visitors: number;
  hasWinner: boolean;
  bestConversion: number;
  uplift: number;
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [experiments, setExperiments] = useState<ExpWithProduct[]>([]);
  const [running, setRunning] = useState<RunningRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const prods = await api.listProducts();
        setProducts(prods);

        const expArrays = await Promise.all(
          prods.map((p) => api.listExperiments(p.id)),
        );
        const exps = expArrays.flatMap((arr, i) =>
          arr.map((e) => ({ ...e, productTitle: prods[i].title })),
        );
        setExperiments(exps);

        const runningExps = exps.filter((e) => e.status === 'running');
        const stats = await Promise.all(
          runningExps.map((e) => api.stats(e.id)),
        );
        setRunning(
          runningExps.map((exp, i) => {
            const st = stats[i];
            const control = st.variants.find((v) => v.isControl);
            const best = st.significance
              ? st.variants.find((v) => v.id === st.significance!.bestChallengerId)
              : null;
            return {
              exp,
              visitors: st.variants.reduce((a, v) => a + v.views, 0),
              hasWinner: Boolean(st.significance?.isSignificant),
              bestConversion: best?.conversionRate ?? control?.conversionRate ?? 0,
              uplift: st.significance?.uplift ?? 0,
            };
          }),
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalVisitors = running.reduce((a, r) => a + r.visitors, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p className="muted">Your testing at a glance.</p>
        </div>
        <Link to="/products">
          <button className="primary">View products</button>
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="stat-cards four">
            <div className="stat-card">
              <span className="muted small">Products</span>
              <strong>{products.length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted small">Experiments</span>
              <strong>{experiments.length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted small">Running</span>
              <strong className={running.length ? 'stat-ok' : ''}>
                {running.length}
              </strong>
            </div>
            <div className="stat-card">
              <span className="muted small">Visitors</span>
              <strong>{totalVisitors.toLocaleString()}</strong>
            </div>
          </div>

          <div className="page-head tight">
            <h2>Active experiments</h2>
          </div>

          {running.length === 0 ? (
            <div className="card empty">
              <p className="muted">
                No running experiments.{' '}
                <Link to="/products" className="alink">
                  Start one →
                </Link>
              </p>
            </div>
          ) : (
            <div className="overview-grid">
              {running.map((r) => (
                <Link
                  key={r.exp.id}
                  to={`/experiments/${r.exp.id}`}
                  className="ov-card"
                >
                  <div className="ov-card-head">
                    <strong>{r.exp.productTitle}</strong>
                    <span className="badge running">Gen {r.exp.generation}</span>
                  </div>

                  <div className="ov-stats">
                    <div>
                      <span className="muted small">Visitors</span>
                      <b>{r.visitors.toLocaleString()}</b>
                    </div>
                    <div>
                      <span className="muted small">Best conversion</span>
                      <b>{pct(r.bestConversion)}</b>
                    </div>
                    <div>
                      <span className="muted small">Lift vs control</span>
                      <b className={r.uplift > 0 ? 'up' : ''}>
                        {r.uplift > 0 ? `+${pct(r.uplift)}` : '—'}
                      </b>
                    </div>
                  </div>

                  <div className="ov-foot">
                    {r.hasWinner ? (
                      <span className="lead-badge">Winner ready</span>
                    ) : (
                      <span className="muted small">Collecting data…</span>
                    )}
                    <span className="alink">View experiment →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}