const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('seo_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

export async function apiSignup(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  if (data.token) localStorage.setItem('seo_token', data.token);
  return data;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.token) localStorage.setItem('seo_token', data.token);
  return data;
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) { localStorage.removeItem('seo_token'); return null; }
  const data = await res.json();
  return data.user;
}

export async function apiForgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function apiResetPassword(token: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function apiRunAudit(url: string) {
  const res = await fetch(`${API_BASE}/audit`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ url }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Audit failed');
  return data;
}

export async function apiGetHistory() {
  const res = await fetch(`${API_BASE}/audit/history`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.audits;
}

export async function apiGetAudit(id: number) {
  const res = await fetch(`${API_BASE}/audit/history/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.result;
}

export async function apiGetUsage() {
  const res = await fetch(`${API_BASE}/audit/usage`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) return { used: 0, limit: 5, remaining: 5 };
  return data;
}

export async function apiUpgradePlan(plan: string, txnRef: string, amount: number) {
  const res = await fetch(`${API_BASE}/subscription/upgrade`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ plan, txnRef, amount }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export function apiLogout() {
  localStorage.removeItem('seo_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
