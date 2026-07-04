const router = require('express').Router();
const prisma = require('../db');

const SHIPPING = 4.90;

function orderNumber() {
  return 'VF-' + Math.floor(1000 + Math.random() * 9000);
}

// POST /api/checkout
// { customer:{firstName,lastName,address,city,zip,phone,email?}, paymentMethod, items:[{productId,quantity}], cartId? }
router.post('/', async (req, res) => {
  try {
    const { customer, paymentMethod = 'cod', items = [], cartId } = req.body;
    if (!customer || !items.length) {
      return res.status(400).json({ error: 'Kunde und Artikel sind erforderlich.' });
    }

    // Preise serverseitig auflösen (nie dem Client vertrauen)
    const ids = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const pMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = pMap[i.productId];
      if (!p) throw new Error('Produkt ' + i.productId + ' nicht gefunden');
      subtotal += p.price * i.quantity;
      return { productId: p.id, nameDe: p.nameDe, unit: p.unit, price: p.price, quantity: i.quantity };
    });
    const total = +(subtotal + SHIPPING).toFixed(2);

    const cust = await prisma.customer.create({
      data: {
        firstName: customer.firstName, lastName: customer.lastName,
        email: customer.email || null, phone: customer.phone || null,
        address: customer.address, city: customer.city, zip: customer.zip,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: cust.id,
        firstName: customer.firstName, lastName: customer.lastName,
        address: customer.address, city: customer.city, zip: customer.zip,
        phone: customer.phone || null,
        paymentMethod,
        subtotal: +subtotal.toFixed(2), shipping: SHIPPING, total,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (cartId) {
      await prisma.cartItem.deleteMany({ where: { cartId } }).catch(() => {});
    }

    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
