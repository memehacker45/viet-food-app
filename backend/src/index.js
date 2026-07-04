const express = require('express');
const cors = require('cors');
const path = require('path');

const products = require('./routes/products');
const categories = require('./routes/categories');
const cart = require('./routes/cart');
const orders = require('./routes/orders');
const customers = require('./routes/customers');
const checkout = require('./routes/checkout');
const support = require('./routes/support');

const app = express();
app.use(cors());
app.use(express.json());

// Produktbilder lokal ausliefern -> http://localhost:4000/uploads/products/<datei>
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/customers', customers);
app.use('/api/checkout', checkout);
app.use('/api/support', support);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API laeuft auf http://localhost:${PORT}`));
