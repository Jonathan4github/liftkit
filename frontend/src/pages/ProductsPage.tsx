import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type Product } from '../api';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError((e as Error).message));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.createProduct({ title, description, price: Number(price) });
      setTitle('');
      setDescription('');
      setPrice('');
      setShowForm(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="muted">Pick a product to optimize, or add a new one.</p>
        </div>
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ New product'}
        </button>
      </div>

      {showForm && (
        <form className="card add-form" onSubmit={create}>
          <div className="add-grid">
            <div>
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="primary" disabled={busy}>
            {busy ? '…' : 'Add product'}
          </button>
        </form>
      )}

      {error && !showForm && <div className="error">{error}</div>}

      {products.length === 0 ? (
        <div className="card empty">
          <p className="muted">No products yet. Add one to start testing.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <span className="product-thumb">{p.title[0]?.toUpperCase() ?? '?'}</span>
              <div className="product-info">
                <strong>{p.title}</strong>
                <span className="muted small">{p.description}</span>
              </div>
              <span className="price">${p.price}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}