import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Experiment, type ExperimentStats } from '../api';

export function ExperimentPage() {
  const { id } = useParams<{ id: string }>();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [stats, setStats] = useState<ExperimentStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [exp, st] = await Promise.all([
        api.getExperiment(id),
        api.stats(id),
      ]);
      setExperiment(exp);
      setStats(st);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>, done: (r: unknown) => void) => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const r = await fn();
      done(r);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const generate = () =>
    run(
      () => api.generate(id!, 3),
      () => setMessage('Generated 3 new challenger variants.'),
    );

  const evaluate = () =>
    run(
      () => api.evaluate(id!),
      (r) => {
        const res = r as Awaited<ReturnType<typeof api.evaluate>>;
        setMessage(
          res.promoted
            ? `Promoted "${res.winner?.title}" → new generation started.`
            : `No promotion: ${res.reason}`,
        );
      },
    );

  if (!experiment || !stats) {
    return (
      <div className="stack">
        {error ? <div className="error">{error}</div> : <p className="muted">Loading…</p>}
      </div>
    );
  }

  const sig = stats.significance;
  const byId = new Map(stats.variants.map((v) => [v.id, v]));

  return (
    <div className="stack">
      <Link to={`/products/${experiment.productId}`} className="back">
        ← Back to product
      </Link>

      <section className="card">
        <div className="exp-head">
          <h2>
            Generation {experiment.generation}{' '}
            <span className={`badge ${experiment.status}`}>{experiment.status}</span>
          </h2>
          <div className="actions">
            <button onClick={generate} disabled={busy || experiment.status !== 'running'}>
              Generate variants
            </button>
            <button
              className="primary"
              onClick={evaluate}
              disabled={busy || experiment.status !== 'running'}
            >
              Run the loop (evaluate)
            </button>
          </div>
        </div>
        {message && <div className="notice">{message}</div>}
        {error && <div className="error">{error}</div>}
      </section>

      {sig && (
        <section className={`card verdict ${sig.isSignificant ? 'win' : 'wait'}`}>
          {sig.isSignificant ? (
            <p>
              <b>Significant winner found.</b> Best challenger lifts conversion by{' '}
              <b>{(sig.uplift * 100).toFixed(0)}%</b> (p = {sig.pValue.toExponential(2)}).
            </p>
          ) : (
            <p>
              <b>No clear winner yet.</b>{' '}
              {sig.enoughData
                ? 'No challenger significantly beats the control.'
                : 'Still collecting data (need ≥100 views per variant).'}
            </p>
          )}
        </section>
      )}

      <section className="card">
        <h3>Variants</h3>
        <table className="stats">
          <thead>
            <tr>
              <th>Variant</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Add to cart</th>
              <th>Conversion</th>
            </tr>
          </thead>
          <tbody>
            {experiment.variants.map((v) => {
              const s = byId.get(v.id);
              const isWinner = sig?.isSignificant && sig.bestChallengerId === v.id;
              return (
                <tr key={v.id} className={isWinner ? 'winner-row' : ''}>
                  <td>
                    <div className="vtitle">
                      {v.title}{' '}
                      {v.isControl && <span className="tag-control">control</span>}
                      {isWinner && <span className="tag-winner">winner</span>}
                    </div>
                    {v.rationale && <div className="muted small">{v.rationale}</div>}
                  </td>
                  <td>{s?.views ?? 0}</td>
                  <td>{s?.clicks ?? 0}</td>
                  <td>{s?.addToCarts ?? 0}</td>
                  <td>{((s?.conversionRate ?? 0) * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
