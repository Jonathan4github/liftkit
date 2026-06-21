import { Link } from 'react-router-dom';
import { Logo } from '../icons/Logo';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BarChartIcon } from '../icons/BarChartIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { LockIcon } from '../icons/LockIcon';

const VARIANTS = [
  { k: 'A', tag: 'Baseline', visitors: '6,108', ctr: '7.17%', cart: '2.71%', imp: '-', prob: '-', status: 'Baseline', color: '#8b5cff' },
  { k: 'B', visitors: '6,215', ctr: '8.36%', cart: '3.15%', imp: '+16.2%', prob: '78%', status: 'Challenger', color: '#3a7bd5', impUp: true },
  { k: 'C', visitors: '6,045', ctr: '9.21%', cart: '3.72%', imp: '+37.3%', prob: '98.6%', status: 'Leading', color: '#38d39f', impUp: true, leading: true },
  { k: 'D', visitors: '6,023', ctr: '6.89%', cart: '2.41%', imp: '-11.1%', prob: '12%', status: 'Challenger', color: '#f4b740', impDown: true },
];

const NAV_ITEMS = ['Dashboard', 'Experiments', 'Variants', 'Results', 'Products', 'Settings'];

function DashboardPreview() {
  return (
    <div className="preview">
      <aside className="preview-side">
        <div className="preview-side-logo">
          <Logo size={20} />
        </div>
        <nav>
          {NAV_ITEMS.map((item, i) => (
            <span key={item} className={`side-item ${i === 0 ? 'active' : ''}`}>
              {item}
            </span>
          ))}
        </nav>
        <div className="side-foot">
          <span className="side-item">Documentation</span>
          <span className="side-item">Support</span>
        </div>
      </aside>

      <div className="preview-main">
        <div className="preview-head">
          <div>
            <span className="running-dot">● Running Experiment</span>
            <h3>Wireless Noise Cancelling Headphones</h3>
            <span className="pid">Product ID: 7f3a…a21b</span>
          </div>
          <span className="view-product">View Product ↗</span>
        </div>

        <div className="preview-stats">
          {[
            ['Visitors', '24,391'],
            ['Views', '24,391'],
            ['Click Rate', '8.73%'],
            ['Add to Cart', '3.29%'],
            ['Status', 'Running', 'ok'],
          ].map(([label, value, ok]) => (
            <div key={label} className="pstat">
              <span className="muted small">{label}</span>
              <span className={ok ? 'stat-ok' : ''}>{value}</span>
            </div>
          ))}
        </div>

        <table className="preview-table">
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
            {VARIANTS.map((v) => (
              <tr key={v.k}>
                <td>
                  <span className="vkey" style={{ background: v.color }}>{v.k}</span>
                  {v.tag && <span className="vbaseline">{v.tag}</span>}
                </td>
                <td>{v.visitors}</td>
                <td>{v.ctr}</td>
                <td>{v.cart}</td>
                <td className={v.impUp ? 'up' : v.impDown ? 'down' : ''}>{v.imp}</td>
                <td>{v.prob}</td>
                <td>
                  {v.leading ? (
                    <span className="lead-badge">Leading</span>
                  ) : (
                    <span className="muted">{v.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="winning">
          <div>
            <span className="trophy">🏆</span>
            <span className="win-text">
              <b>Variant C is winning!</b>
              <span className="muted small">
                It has a 98.6% probability of outperforming the baseline.
              </span>
            </span>
          </div>
          <button className="promote">Promote Winner</button>
        </div>

        <div className="ai-gen">
          <div className="ai-gen-row">
            <span>
              <b>AI Generation</b>
              <span className="muted small"> - Generating new variants…</span>
            </span>
            <span className="muted small">✶ Powered by Claude</span>
          </div>
          <div className="bar">
            <div className="bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    Icon: SparklesIcon,
    title: 'AI-Powered Variants',
    body: 'Claude generates compelling product page variants that convert.',
  },
  {
    Icon: BarChartIcon,
    title: 'Statistical Confidence',
    body: 'Built-in significance testing ensures winners are real, not random.',
  },
  {
    Icon: RefreshIcon,
    title: 'Auto-Optimize',
    body: 'Winners get promoted automatically. The engine never stops improving.',
  },
  {
    Icon: LockIcon,
    title: 'Privacy First',
    body: '100% anonymous visitor data. No cookies. No tracking.',
  },
];

export function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo />
        <div className="nav-cta">
          <Link to="/login" className="nav-signin">Sign in</Link>
          <Link to="/login">
            <button className="primary">Get Started</button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="pill">GENERATIVE A/B TESTING</span>
          <h1>
            Let AI find your best{' '}
            <span className="grad">converting</span> page.
          </h1>
          <p className="lede">
            Liftkit writes new versions of your product pages, tests them on
            real shoppers, and keeps whatever sells best. You get more carts and
            less guesswork, on autopilot.
          </p>
          <div className="hero-cta">
            <Link to="/login">
              <button className="primary big">Start Testing Now →</button>
            </Link>
          </div>
          <div className="builtfor">
            <span className="muted small">BUILT FOR MODERN E-COMMERCE</span>
            <div className="logos">
              <span>◆ Amboras</span>
              <span>◈ NestJS</span>
              <span>△ Prisma</span>
              <span>🐘 PostgreSQL</span>
            </div>
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="features">
        {FEATURES.map(({ Icon, title, body }) => (
          <div key={title} className="feature">
            <div className="feature-icon">
              <Icon />
            </div>
            <h4>{title}</h4>
            <p className="muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
