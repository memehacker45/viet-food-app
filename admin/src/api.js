// API client cho admin — gắn x-admin-key vào mọi request.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getKey = () => localStorage.getItem('vf-admin-key') || '';
export const setKey = (k) => localStorage.setItem('vf-admin-key', k);
export const logout = () => { localStorage.removeItem('vf-admin-key'); location.reload(); };

async function req(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      'x-admin-key': getKey(),
      ...options.headers,
    },
  });
  if (res.status === 401) { logout(); throw new Error('unauthorized'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const imageUrl = (file) => (file ? `${API_URL}/uploads/products/${file}` : null);

export const api = {
  login: (password) => fetch(`${API_URL}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }).then((r) => { if (!r.ok) throw new Error('Sai mật khẩu'); return r.json(); }),
  stats: () => req('/api/admin/stats'),
  categories: () => req('/api/categories'),
  products: () => req('/api/products'),
  createProduct: (data) => req('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => req(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => req(`/api/admin/products/${id}`, { method: 'DELETE' }),
  upload: (file) => { const f = new FormData(); f.append('image', file); return req('/api/admin/upload', { method: 'POST', body: f }); },
  orders: (status) => req(`/api/admin/orders${status ? `?status=${status}` : ''}`),
  setOrderStatus: (id, status) => req(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  chats: () => req('/api/admin/chats'),
  chatMessages: (sid) => req(`/api/admin/chats/${sid}/messages`),
  reply: (sid, body) => req(`/api/admin/chats/${sid}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
};
