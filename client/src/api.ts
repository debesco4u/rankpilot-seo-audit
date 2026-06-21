const BASE = '/api';
function getToken(): string | null { return localStorage.getItem('rp_token'); }
async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...options.headers as any };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  register: (email: string, password: string, name: string) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  getPlans: () => request('/payment/plans'),
  activatePlan: (plan: string) => request('/payment/activate', { method: 'POST', body: JSON.stringify({ plan }) }),
  cancelPlan: () => request('/payment/cancel', { method: 'POST' }),
  getPaymentHistory: () => request('/payment/history'),
  runAudit: (url: string) => request('/audit/run', { method: 'POST', body: JSON.stringify({ url }) }),
  getAuditHistory: () => request('/audit/history'),
  getAudit: (id: string) => request('/audit/' + id),
  getPdfUrl: (id: string) => BASE + '/audit/pdf/' + id,
};
export function setToken(token: string) { localStorage.setItem('rp_token', token); }
export function clearToken() { localStorage.removeItem('rp_token'); }
