const BASE = '/api';

async function req(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error || res.statusText); }
  return res.json();
}

export const api = {
  register: (email: string, password: string, name: string) => req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  profile: () => req('/auth/profile'),
  audit: (url: string) => req('/audit', { method: 'POST', body: JSON.stringify({ url }) }),
  history: () => req('/audits'),
  forgotPassword: (email: string) => req('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => req('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};
