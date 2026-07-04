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

  await prisma.supportMessage.create({ data: { sessionId, sender, body, productId } });

  let agent = null;
  if (sender === 'user') {
    const reply = autoReply(body);
    agent = await prisma.supportMessage.create({
      data: { sessionId, sender: 'agent', body: reply },
    });
  }

  const msgs = await prisma.supportMessage.findMany({
    where: { sessionId }, orderBy: { createdAt: 'asc' },
  });
  res.status(201).json({ messages: msgs, agentReply: agent });
});

function autoReply(text) {
  const t = text.toLowerCase();
  if (t.includes('bestell') || t.includes('order') || t.includes('vf-'))
    return 'Ich schaue sofort für Sie nach. Ihre Bestellung befindet sich in der Zustellung und sollte heute zwischen 14:00 und 16:00 Uhr eintreffen.';
  if (t.includes('lager') || t.includes('verfügbar') || t.includes('ausverkauft'))
    return 'Gerne prüfe ich die Verfügbarkeit. Möchten Sie benachrichtigt werden, sobald der Artikel wieder auf Lager ist?';
  if (t.includes('liefer') || t.includes('versand'))
    return 'Wir liefern innerhalb von 1–2 Werktagen. Frische Kräuter werden mit Kühlakkus verpackt.';
  return 'Vielen Dank für Ihre Nachricht! Ein Mitarbeiter kümmert sich gleich darum. Kann ich sonst noch etwas für Sie tun?';
}

module.exports = router;
