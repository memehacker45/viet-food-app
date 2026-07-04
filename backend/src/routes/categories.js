const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (_req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(cats);
});

module.exports = router;
