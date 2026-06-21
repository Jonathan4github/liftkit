import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type Product } from '../api';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
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

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.createProduct({
        title,
        description,
        price: Number(price),
      });
      setTitle('');
      setDescription('');
      setPrice('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Your products</h2>
        {products.length === 0 && (
          <p className="muted">No products yet. Add one to start testing.</p>
        )}
        <ul className="list">
          {products.map((p) => (
            <li key={p.id}>
              <Link to={`/products/${p.id}`} className="row-link">
                <span>{p.title}</span>
                <span className="muted">${p.price}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Add a product</h2>
        <form onSubmit={create}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? '…' : 'Add product'}
          </button>
        </form>
      </section>
    </div>
  );
}