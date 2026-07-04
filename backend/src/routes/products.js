const router = require('express').Router();
const prisma = require('../db');

function serialize(p) {
  return { ...p, badges: p.badges ? JSON.parse(p.badges) : [] };
}

// GET /api/products?category=slug&search=q
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const where = {};
  if (category && category !== 'all') where.category = { slug: category };
  if (search) {
    where.OR = [
      { nameDe: { contains: search } },
      { nameVi: { contains: search } },
      { subtitleDe: { contains: search } },
    ];
  }
  const items = await prisma.product.findMany({ where, include: { category: true }, orderBy: { id: 'asc' } });
  res.json(items.map(serialize));
});

// GET /api/products/:idOrSlug
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  const where = /^\d+$/.test(key) ? { id: Number(key) } : { slug: key };
  const p = await prisma.product.findUnique({ where, include: { category: true } });
  if (!p) return res.status(404).json({ error: 'Produkt nicht gefunden' });
  res.json(serialize(p));
});

module.exports = router;
