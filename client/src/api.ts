const BASE = '/api';

async function req(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('rp_token');
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...opts.headers as Record<string,string> };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    req('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/auth/me'),

  // Forgot / Reset password
  forgotPassword: async (email: string) => {
    const r = await fetch(`${BASE}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (!r.ok) throw new Error((await r.json()).error);
    return r.json();
  },
  resetPassword: async (token: string, newPassword: string) => {
    const r = await fetch(`${BASE}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword }) });
    if (!r.ok) throw new Error((await r.json()).error);
    return r.json();
  },

  // Subscription
  subscribe: (tier: string) =>
    req('/subscribe', { method: 'POST', body: JSON.stringify({ tier }) }),

  // Audit
  audit: (url: string) =>
    req('/audit', { method: 'POST', body: JSON.stringify({ url }) }),

  // History
  getHistory: () => req('/history'),
  getAudit: (id: string) => req(`/history/${id}`),

  // PDF
  getPdfUrl: (id: string) => `${BASE}/pdf/${id}`,
};
