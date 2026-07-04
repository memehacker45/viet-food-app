const router = require('express').Router();
const prisma = require('../db');

async function getCart(id) {
  return prisma.cart.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}

// POST /api/cart  -> neuen Warenkorb anlegen
router.post('/', async (_req, res) => {
  const cart = await prisma.cart.create({ data: {} });
  res.status(201).json(await getCart(cart.id));
});

// GET /api/cart/:id
router.get('/:id', async (req, res) => {
  const cart = await getCart(req.params.id);
  if (!cart) return res.status(404).json({ error: 'Warenkorb nicht gefunden' });
  res.json(cart);
});

// POST /api/cart/:id/items  { productId, quantity }
router.post('/:id/items', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const cartId = req.params.id;
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    create: { cartId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  res.json(await getCart(cartId));
});

// PATCH /api/cart/:id/items/:productId  { quantity }
router.patch('/:id/items/:productId', async (req, res) => {
  const cartId = req.params.id;
  const productId = Number(req.params.productId);
  const { quantity } = req.body;
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId, productId } });
  } else {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId, productId } },
      data: { quantity },
    });
  }
  res.json(await getCart(cartId));
});

// DELETE /api/cart/:id/items/:productId
router.delete('/:id/items/:productId', async (req, res) => {
  await prisma.cartItem.deleteMany({
    where: { cartId: req.params.id, productId: Number(req.params.productId) },
  });
  res.json(await getCart(req.params.id));
});

module.exports = router;
