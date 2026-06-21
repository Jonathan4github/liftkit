import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Experiment, type ExperimentStats, type VariantStat } from '../api';
import { improvementVsControl, probabilityBeatsControl } from '../stats';

const KEY_COLORS = ['#8b5cff', '#3a7bd5', '#38d39f', '#f4b740', '#e0709a', '#4cc0c0'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const signedPct = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;

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
      const [exp, st] = await Promise.all([api.getExperiment(id), api.stats(id)]);
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
            ? `Promoted "${res.winner?.title}" — a new generation has started.`
            : `No promotion yet: ${res.reason}`,
        );
      },
    );

  if (!experiment || !stats) {
    return (
      <div className="exp">
        {error ? <div className="error">{error}</div> : <p className="muted">Loading…</p>}
      </div>
    );
  }

  const sig = stats.significance;
  const isRunning = experiment.status === 'running';
  const control = stats.variants.find((v) => v.isControl) ?? stats.variants[0];

  const totals = stats.variants.reduce(
    (a, v) => ({
      views: a.views + v.views,
      clicks: a.clicks + v.clicks,
      carts: a.carts + v.addToCarts,
    }),
    { views: 0, clicks: 0, carts: 0 },
  );

  // control first, then challengers — assign letters/colors by position
  const ordered = [
    ...stats.variants.filter((v) => v.isControl),
    ...stats.variants.filter((v) => !v.isControl),
  ];
  const meta = new Map(experiment.variants.map((v) => [v.id, v]));

  const clickRate = (v: VariantStat) => (v.views ? v.clicks / v.views : 0);

  return (
    <div className="exp">
      <section className="exp-card">
        <div className="exp-top">
          <div>
            <span className={`run-tag ${experiment.status}`}>
              ● {isRunning ? 'Running Experiment' : 'Finished'}
            </span>
            <h2>Generation {experiment.generation}</h2>
            <span className="pid">Experiment ID: {experiment.id.slice(0, 10)}…</span>
          </div>
          <div className="exp-actions">
            <button onClick={generate} disabled={busy || !isRunning}>
              Generate variants
            </button>
            <Link to={`/products/${experiment.productId}`} className="btn-ghost">
              View Product ↗
            </Link>
          </div>
        </div>

        {message && <div className="notice">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="stat-cards">
          {[
            ['Visitors', totals.views.toLocaleString()],
            ['Views', totals.views.toLocaleString()],
            ['Click Rate', totals.views ? pct(totals.clicks / totals.views) : '—'],
            ['Add to Cart', totals.views ? pct(totals.carts / totals.views) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="stat-card">
              <span className="muted small">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="stat-card">
            <span className="muted small">Status</span>
            <strong className={isRunning ? 'stat-ok' : ''}>
              {isRunning ? 'Running' : 'Finished'}
            </strong>
          </div>
        </div>

        <table className="vtable">
          <thead>
            <tr>
              <th>Variant</th>
              <th>Visitors</th>
              <th>Click Rate</th>
              <th>Add to Cart</th>
              <th>Improvement</th>
              <th>Probability</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((v, i) => {
              const isLeading = sig?.isSignificant && sig.bestChallengerId === v.id;
              const imp = v.isControl ? null : improvementVsControl(control, v);
              const prob = v.isControl ? null : probabilityBeatsControl(control, v);
              return (
                <tr key={v.id} className={isLeading ? 'lead-row' : ''}>
                  <td>
                    <span className="vkey" style={{ background: KEY_COLORS[i % KEY_COLORS.length] }}>
                      {LETTERS[i] ?? '•'}
                    </span>
                    <span className="vname">{meta.get(v.id)?.title ?? v.title}</span>
                    {v.isControl && <span className="vbaseline">Baseline</span>}
                  </td>
                  <td>{v.views.toLocaleString()}</td>
                  <td>{pct(clickRate(v))}</td>
                  <td>{pct(v.conversionRate)}</td>
                  <td className={imp == null ? '' : imp >= 0 ? 'up' : 'down'}>
                    {imp == null ? '—' : signedPct(imp)}
                  </td>
                  <td>{prob == null ? '—' : `${(prob * 100).toFixed(1)}%`}</td>
                  <td>
                    {isLeading ? (
                      <span className="lead-badge">Leading</span>
                    ) : (
                      <span className="muted">{v.isControl ? 'Baseline' : 'Challenger'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sig?.isSignificant ? (
          <div className="win-banner">
            <div>
              <span className="trophy">🏆</span>
              <span className="win-text">
                <b>
                  Variant {LETTERS[ordered.findIndex((v) => v.id === sig.bestChallengerId)]} is
                  winning!
                </b>
                <span className="muted small">
                  {(sig.uplift * 100).toFixed(0)}% lift, with a{' '}
                  {((1 - sig.pValue) * 100).toFixed(1)}% probability of beating the baseline.
                </span>
              </span>
            </div>
            <button className="promote" onClick={evaluate} disabled={busy || !isRunning}>
              Promote Winner
            </button>
          </div>
        ) : (
          isRunning && (
            <div className="collecting">
              <span className="muted">
                {sig?.enoughData
                  ? 'No challenger has significantly beaten the control yet.'
                  : 'Collecting data — need at least 100 views per variant to call a winner.'}
              </span>
              <button onClick={evaluate} disabled={busy}>
                Run the loop
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}
