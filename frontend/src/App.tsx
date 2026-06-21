import { Navigate, Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Logo } from './icons/Logo';
import { BoxIcon } from './icons/BoxIcon';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductPage } from './pages/ProductPage';
import { ExperimentPage } from './pages/ExperimentPage';

function Layout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={24} />
        </div>
        <nav className="side-nav">
          <Link to="/dashboard" className="side-link active">
            <BoxIcon />
            Products
          </Link>
        </nav>
        <div className="sidebar-foot">
          <div className="side-account">
            <span className="avatar">{(email ?? '?')[0].toUpperCase()}</span>
            <span className="side-email">{email}</span>
          </div>
          <button className="link" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="shell-main">{children}</main>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { email, ready } = useAuth();
  if (!ready) return <div className="centered muted">Loading…</div>;
  if (!email) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { email, ready } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          ready && email ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <ProductsPage />
          </Protected>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Protected>
            <ProductPage />
          </Protected>
        }
      />
      <Route
        path="/experiments/:id"
        element={
          <Protected>
            <ExperimentPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
