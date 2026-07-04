// API cho web admin. Tất cả route (trừ /login) yêu cầu header x-admin-key.
const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const prisma = require('../db');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vietfood2026';

// ---- Auth ----
function adminAuth(req, res, next) {
  if (req.headers['x-admin-key'] === ADMIN_PASSWORD) return next();
  res.status(401).json({ error: 'Sai mật khẩu admin' });
}

// POST /api/admin/login { password }
router.post('/login', (req, res) => {
  if (req.body?.password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ error: 'Sai mật khẩu' });
});

router.use(adminAuth);

// ---- Dashboard ----
router.get('/stats', async (_req, res) => {
  const [products, orders, pending] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
  ]);
  // Chat cần trả lời: session mà tin cuối là của khách
  const msgs = await prisma.supportMessage.findMany({ orderBy: { createdAt: 'desc' } });
  const seen = new Set(); let needReply = 0;
  for (const m of msgs) {
    if (seen.has(m.sessionId)) continue;
    seen.add(m.sessionId);
    if (m.sender === 'user') needReply++;
  }
  res.json({ products, orders, pending, needReply, chats: seen.size });
});

// ---- Upload ảnh sản phẩm ----
const uploadDir = process.env.UPLOADS_DIR
  ? path.join(process.env.UPLOADS_DIR, 'products')
  : path.join(__dirname, '..', '..', 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, 'p-' + Date.now() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /image\/(jpeg|png|webp)/.test(file.mimetype) ? cb(null, true) : cb(new Error('Chỉ nhận JPG/PNG/WebP')),
});

// POST /api/admin/upload  (form-data: image) -> { filename }
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Thiếu file ảnh' });
  res.json({ filename: req.file.filename });
});

// ---- Products CRUD ----
const PRODUCT_FIELDS = ['slug','nameDe','nameVi','nameEn','subtitleDe','subtitleVi','subtitleEn',
  'descriptionDe','descriptionVi','descriptionEn','origin','unit','image','inStock','categoryId'];

function pickProduct(body) {
  const data = {};
  for (const f of PRODUCT_FIELDS) if (body[f] !== undefined) data[f] = body[f];
  if (data.categoryId !== undefined) data.categoryId = Number(data.categoryId);
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice);
  if (body.badges !== undefined) data.badges = Array.isArray(body.badges) ? JSON.stringify(body.badges) : body.badges || null;
  if (data.inStock !== undefined) data.inStock = Boolean(data.inStock);
  return data;
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const data = pickProduct(req.body);
    if (!data.nameDe || !data.price || !data.categoryId)
      return res.status(400).json({ error: 'Cần tối thiểu: tên tiếng Đức, giá, danh mục' });
    if (!data.nameVi) data.nameVi = data.nameDe;
    if (!data.slug) data.slug = slugify(data.nameDe);
    // slug trùng -> thêm hậu tố
    if (await prisma.product.findUnique({ where: { slug: data.slug } }))
      data.slug += '-' + Date.now().toString().slice(-4);
    const p = await prisma.product.create({ data, include: { category: true } });
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const data = pickProduct(req.body);
    delete data.slug; // giữ slug ổn định, link đã chia sẻ không chết
    const p = await prisma.product.update({ where: { id: Number(req.params.id) }, data, include: { category: true } });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/products/:id — nếu đã nằm trong đơn hàng thì không xóa được, chỉ ẩn
router.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    await prisma.product.update({ where: { id }, data: { inStock: false } });
    return res.status(409).json({ error: 'Món này đã có trong đơn hàng nên không xóa được. Đã chuyển sang Hết hàng (ẩn khỏi mua).' });
  }
  await prisma.cartItem.deleteMany({ where: { productId: id } });
  const p = await prisma.product.delete({ where: { id } });
  if (p.image) fs.unlink(path.join(uploadDir, p.image), () => {});
  res.json({ ok: true });
});

// ---- Orders ----
// GET /api/admin/orders?status=pending
router.get('/orders', async (req, res) => {
  const where = req.query.status ? { status: req.query.status } : {};
  const orders = await prisma.order.findMany({
    where, orderBy: { createdAt: 'desc' }, include: { items: true },
  });
  res.json(orders);
});

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// PATCH /api/admin/orders/:id { status }
router.patch('/orders/:id', async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  const o = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status }, include: { items: true } });
  res.json(o);
});

// ---- Support chat ----
// GET /api/admin/chats -> danh sách hội thoại, tin mới nhất trước, cờ needReply
router.get('/chats', async (_req, res) => {
  const msgs = await prisma.supportMessage.findMany({ orderBy: { createdAt: 'asc' } });
  const map = new Map();
  for (const m of msgs) {
    const s = map.get(m.sessionId) || { sessionId: m.sessionId, count: 0 };
    s.count++; s.last = m;
    map.set(m.sessionId, s);
  }
  const list = [...map.values()]
    .map((s) => ({ ...s, needReply: s.last.sender === 'user' }))
    .sort((a, b) => new Date(b.last.createdAt) - new Date(a.last.createdAt));
  res.json(list);
});

// GET /api/admin/chats/:sessionId/messages
router.get('/chats/:sessionId/messages', async (req, res) => {
  const msgs = await prisma.supportMessage.findMany({
    where: { sessionId: req.params.sessionId }, orderBy: { createdAt: 'asc' },
  });
  res.json(msgs);
});

// POST /api/admin/chats/:sessionId/messages { body } -> gửi với sender 'agent'
router.post('/chats/:sessionId/messages', async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Tin nhắn trống' });
  const m = await prisma.supportMessage.create({
    data: { sessionId: req.params.sessionId, sender: 'agent', body },
  });
  res.status(201).json(m);
});

module.exports = router;
