const router = require('express').Router();
const prisma = require('../db');

router.get('/:id', async (req, res) => {
  const c = await prisma.customer.findUnique({
    where: { id: Number(req.params.id) },
    include: { orders: true },
  });
  if (!c) return res.status(404).json({ error: 'Kunde nicht gefunden' });
  res.json(c);
});

module.exports = router;
