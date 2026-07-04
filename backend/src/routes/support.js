const router = require('express').Router();
const prisma = require('../db');

// GET /api/support/:sessionId/messages
router.get('/:sessionId/messages', async (req, res) => {
  const msgs = await prisma.supportMessage.findMany({
    where: { sessionId: req.params.sessionId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(msgs);
});

// POST /api/support/:sessionId/messages  { body, sender?, productId? }
// Speichert die Nutzernachricht und erzeugt eine einfache Auto-Antwort des Agenten.
router.post('/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;
  const { body, sender = 'user', productId = null } = req.body;
  if (!body) return res.status(400).json({ error: 'Nachricht darf nicht leer sein.' });

  const isFirst = (await prisma.supportMessage.count({ where: { sessionId } })) === 0;
  await prisma.supportMessage.create({ data: { sessionId, sender, body, productId } });

  // Chỉ gửi 1 tin xác nhận tự động cho TIN NHẮN ĐẦU TIÊN của khách.
  // Các tin sau do admin trả lời thật qua web admin (sender: 'agent').
  let agent = null;
  if (sender === 'user' && isFirst) {
    agent = await prisma.supportMessage.create({
      data: {
        sessionId, sender: 'agent',
        body: 'Vielen Dank für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen. / Cảm ơn bạn đã nhắn tin! Chúng tôi sẽ trả lời sớm nhất có thể.',
      },
    });
  }

  const msgs = await prisma.supportMessage.findMany({
    where: { sessionId }, orderBy: { createdAt: 'asc' },
  });
  res.status(201).json({ messages: msgs, agentReply: agent });
});


module.exports = router;
