import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Experiment, type Product } from '../api';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const products = await api.listProducts();
      setProduct(products.find((p) => p.id === id) ?? null);
      setExperiments(await api.listExperiments(id));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const start = async () => {
    if (!id) return;
    setError(null);
    setBusy(true);
    try {
      await api.startExperiment(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const hasRunning = experiments.some((e) => e.status === 'running');

  return (
    <div className="stack">
      <Link to="/dashboard" className="back">
        ← All products
      </Link>

      <section className="card">
        <h2>{product ? product.title : 'Product'}</h2>
        {product && (
          <p className="muted">
            ${product.price} - {product.description}
          </p>
        )}
        <button onClick={start} disabled={busy || hasRunning}>
          {hasRunning ? 'Experiment running' : busy ? '…' : 'Start new experiment'}
        </button>
        {error && <div className="error">{error}</div>}
      </section>

      <section className="card">
        <h2>Experiments</h2>
        {experiments.length === 0 && (
          <p className="muted">No experiments yet.</p>
        )}
        <ul className="list">
          {experiments.map((e) => (
            <li key={e.id}>
              <Link to={`/experiments/${e.id}`} className="row-link">
                <span>
                  Generation {e.generation}{' '}
                  <span className={`badge ${e.status}`}>{e.status}</span>
                </span>
                <span className="muted">{e.variants.length} variants</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
