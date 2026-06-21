import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, getToken, setToken } from './api';

interface AuthState {
  email: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api
      .me()
      .then((m) => setEmail(m.email))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (e: string, p: string) => {
    const { accessToken } = await api.login(e, p);
    setToken(accessToken);
    const m = await api.me();
    setEmail(m.email);
  };

  const register = async (e: string, p: string) => {
    const { accessToken } = await api.register(e, p);
    setToken(accessToken);
    const m = await api.me();
    setEmail(m.email);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ email, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}