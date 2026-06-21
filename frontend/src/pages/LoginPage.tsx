import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Logo } from '../icons/Logo';
import { MailIcon } from '../icons/MailIcon';
import { LockIcon } from '../icons/LockIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BarChartIcon } from '../icons/BarChartIcon';
import { RefreshIcon } from '../icons/RefreshIcon';

const FEATURES = [
  {
    Icon: SparklesIcon,
    title: 'AI-Generated Variants',
    body: 'Claude writes high-converting titles, descriptions, and prices that truly resonate.',
  },
  {
    Icon: BarChartIcon,
    title: 'Statistically Significant',
    body: 'Built-in significance testing ensures winners are real, not random.',
  },
  {
    Icon: RefreshIcon,
    title: 'Auto-Optimize Forever',
    body: 'Winners get promoted, new challengers are created, and the loop never stops.',
  },
  {
    Icon: LockIcon,
    title: 'Privacy First',
    body: '100% anonymous visitor data. No cookies. No tracking.',
  },
];

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <aside className="auth-left">
        <Link to="/" className="auth-logo">
          <Logo size={30} />
        </Link>

        <div className="auth-hero">
          <h1>
            AI-powered
            <br />
            A/B testing
            <br />
            <span className="grad">that never stops</span>
          </h1>
          <p>
            Liftkit generates, tests, and optimizes your product pages
            automatically, so you get more clicks and carts without the
            guesswork.
          </p>
        </div>

        <ul className="auth-features">
          {FEATURES.map(({ Icon, title, body }) => (
            <li key={title} className="auth-feature">
              <span className="feature-icon">
                <Icon />
              </span>
              <div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-logo">
            <Logo size={26} />
          </div>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="muted auth-sub">
            {isLogin
              ? 'Sign in to your account to continue'
              : 'Start optimizing your product pages'}
          </p>

          <label>Email address</label>
          <div className="input-wrap">
            <span className="left-icon">
              <MailIcon />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="label-row">
            <label>Password</label>
            {isLogin && (
              <button
                type="button"
                className="forgot"
                onClick={() =>
                  setInfo('Password reset isn’t enabled in this demo yet.')
                }
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="input-wrap">
            <span className="left-icon">
              <LockIcon />
            </span>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
            <button
              type="button"
              className="right-icon"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <EyeIcon off={showPw} />
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {info && <div className="hint">{info}</div>}

          <button type="submit" className="primary big full" disabled={busy}>
            {busy ? '…' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <p className="auth-bottom">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode(isLogin ? 'register' : 'login');
                setError(null);
                setInfo(null);
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
