import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Experiment, type Product } from '../api';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

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
    <div className="page">
      <Link to="/products" className="back">
        <ArrowLeftIcon />
        Products
      </Link>

      <section className="card product-hero">
        <div>
          <h1>{product ? product.title : 'Product'}</h1>
          {product && (
            <p className="muted">
              ${product.price} · {product.description}
            </p>
          )}
        </div>
        <button className="primary" onClick={start} disabled={busy || hasRunning}>
          {hasRunning ? 'Experiment running' : busy ? '…' : 'Start new experiment'}
        </button>
      </section>

      {error && <div className="error">{error}</div>}

      <div className="page-head tight">
        <h2>Experiments</h2>
      </div>

      {experiments.length === 0 ? (
        <div className="card empty">
          <p className="muted">No experiments yet. Start one to generate variants.</p>
        </div>
      ) : (
        <div className="exp-list">
          {experiments.map((e) => (
            <Link key={e.id} to={`/experiments/${e.id}`} className="exp-row">
              <span className="exp-gen">
                Generation {e.generation}{' '}
                <span className={`badge ${e.status}`}>{e.status}</span>
              </span>
              <span className="muted small">{e.variants.length} variants</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
