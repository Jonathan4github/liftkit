import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Experiment } from '../api';
import { ExperimentDashboard } from '../components/ExperimentDashboard';

type ExpWithProduct = Experiment & { productTitle: string };

export function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<ExpWithProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const products = await api.listProducts();
        const expArrays = await Promise.all(
          products.map((p) => api.listExperiments(p.id)),
        );
        const runningExps = expArrays
          .flatMap((arr, i) =>
            arr.map((e) => ({ ...e, productTitle: products[i].title })),
          )
          .filter((e) => e.status === 'running');
        setRunning(runningExps);
        setSelectedId(runningExps[0]?.id ?? null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Your live experiments.</p>
        </div>
        <Link to="/products">
          <button className="primary">View products</button>
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : running.length === 0 ? (
        <div className="card empty">
          <p className="muted">
            No running experiments.{' '}
            <Link to="/products" className="alink">
              Start one →
            </Link>
          </p>
        </div>
      ) : (
        <>
          {running.length > 1 && (
            <div className="exp-tabs">
              {running.map((r) => (
                <button
                  key={r.id}
                  className={`exp-tab ${r.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  {r.productTitle} · Gen {r.generation}
                </button>
              ))}
            </div>
          )}
          {selectedId && (
            <ExperimentDashboard experimentId={selectedId} detailed={false} />
          )}
        </>
      )}
    </div>
  );
}