const router = require('express').Router();
const prisma = require('../db');

router.get('/:orderNumber', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true, customer: true },
  });
  if (!order) return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  res.json(order);
});

module.exports = router;
