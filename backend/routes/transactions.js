const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_TYPES = ['entrada', 'saida'];

function isValidPayload({ title, amount, type, date }) {
  return (
    typeof title === 'string' &&
    title.trim().length > 0 &&
    typeof amount === 'number' &&
    amount > 0 &&
    VALID_TYPES.includes(type) &&
    typeof date === 'string' &&
    date.trim().length > 0
  );
}

router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC')
    .all(req.session.userId);
  res.json(rows);
});

router.post('/', (req, res) => {
  if (!isValidPayload(req.body)) {
    return res.status(400).json({
      error: 'Dados inválidos. Informe title (texto), amount (número > 0), type (entrada/saida) e date.',
    });
  }

  const { title, amount, type, date, category } = req.body;
  const result = db
    .prepare(
      'INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.session.userId, title.trim(), amount, type, category || 'Outros', date);

  const created = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(result.lastInsertRowid, req.session.userId);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, req.session.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  if (!isValidPayload(req.body)) {
    return res.status(400).json({
      error: 'Dados inválidos. Informe title (texto), amount (número > 0), type (entrada/saida) e date.',
    });
  }

  const { title, amount, type, date, category } = req.body;
  db.prepare(
    'UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, date = ? WHERE id = ? AND user_id = ?'
  ).run(title.trim(), amount, type, category || 'Outros', date, id, req.session.userId);

  const updated = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, req.session.userId);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, req.session.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, req.session.userId);
  res.status(204).send();
});

module.exports = router;
