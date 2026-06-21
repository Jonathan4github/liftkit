const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'liftkit_token';

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(value: string | null) {
  token = value;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `Request failed (${res.status})`);
    throw new Error(message);
  }
  return data as T;
}

export interface Variant {
  id: string;
  title: string;
  description: string;
  price: string;
  isControl: boolean;
  rationale: string | null;
}

export interface Experiment {
  id: string;
  status: 'running' | 'finished';
  generation: number;
  productId: string;
  variants: Variant[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
}

export interface VariantStat {
  id: string;
  title: string;
  isControl: boolean;
  views: number;
  clicks: number;
  addToCarts: number;
  conversionRate: number;
}

export interface Significance {
  controlId: string;
  bestChallengerId: string;
  zScore: number;
  pValue: number;
  uplift: number;
  enoughData: boolean;
  isSignificant: boolean;
}

export interface ExperimentStats {
  experimentId: string;
  status: 'running' | 'finished';
  generation: number;
  variants: VariantStat[];
  significance: Significance | null;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; email: string }>('/auth/me'),

  listProducts: () => request<Product[]>('/products'),
  createProduct: (p: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  }) => request<Product>('/products', { method: 'POST', body: JSON.stringify(p) }),

  listExperiments: (productId: string) =>
    request<Experiment[]>(`/products/${productId}/experiments`),
  startExperiment: (productId: string) =>
    request<Experiment>(`/products/${productId}/experiments`, { method: 'POST' }),

  getExperiment: (id: string) => request<Experiment>(`/experiments/${id}`),
  generate: (id: string, count: number) =>
    request<Experiment>(`/experiments/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),
  stats: (id: string) => request<ExperimentStats>(`/experiments/${id}/stats`),
  evaluate: (id: string) =>
    request<{
      promoted: boolean;
      reason?: string;
      winner?: { id: string; title: string };
      newExperiment?: Experiment;
      significance: Significance | null;
    }>(`/experiments/${id}/evaluate`, { method: 'POST' }),
};