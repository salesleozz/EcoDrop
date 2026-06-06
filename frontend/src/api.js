const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('ecodrop_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.');
  return data;
}

export const api = {
  register: (email, senha) => request('/api/auth/register', { method: 'POST', body: { email, senha } }),
  login: (email, senha) => request('/api/auth/login', { method: 'POST', body: { email, senha } }),
  me: () => request('/api/score/me', { auth: true }),
  submitScore: (score) => request('/api/score/submit', { method: 'POST', body: { score }, auth: true }),
};