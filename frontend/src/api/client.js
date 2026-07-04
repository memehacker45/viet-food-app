// Zentraler API-Client. Basis-URL aus .env (VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function req(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Hilfsfunktion: Bild-URL eines Produkts aufloesen.
// Liegt das Bild lokal beim Backend -> /uploads/products/<datei>.
// Cơ chế dễ thay ảnh: chỉ cần đổi field `image` trong DB, hoặc thay file cùng tên.
export function imageUrl(product) {
  if (!product?.image) return '/logo.png';
  if (product.image.startsWith('http')) return product.image;
  return `${API_URL}/uploads/products/${product.image}`;
}

export const api = {
  getCategories: () => req('/api/categories'),
  getProducts: ({ category, search } = {}) => {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (search) q.set('search', search);
    const qs = q.toString();
    return req(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (key) => req(`/api/products/${key}`),
  checkout: (payload) => req('/api/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (orderNumber) => req(`/api/orders/${orderNumber}`),
  getMessages: (sessionId) => req(`/api/support/${sessionId}/messages`),
  sendMessage: (sessionId, body, productId = null) =>
    req(`/api/support/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body, sender: 'user', productId }),
    }),
};

export { API_URL };
