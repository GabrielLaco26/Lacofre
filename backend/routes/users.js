const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getUserById, getUserByEmail, toSafeUser } = require('../lib/users');

const router = express.Router();

const VALID_CURRENCIES = ['BRL', 'USD', 'EUR'];
const VALID_THEMES = ['light', 'dark'];

router.put('/me', requireAuth, (req, res) => {
  const current = getUserById(req.session.userId);
  const {
    name = current.name,
    email = current.email,
    avatar = current.avatar,
    currency = current.currency,
    theme = current.theme,
  } = req.body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Nome inválido.' });
  }
  if (typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ error: 'Email inválido.' });
  }
  if (!VALID_CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: 'Moeda inválida.' });
  }
  if (!VALID_THEMES.includes(theme)) {
    return res.status(400).json({ error: 'Tema inválido.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = getUserByEmail(normalizedEmail);
  if (existing && existing.id !== current.id) {
    return res.status(409).json({ error: 'Já existe uma conta com esse email.' });
  }

  db.prepare(
    'UPDATE users SET name = ?, email = ?, avatar = ?, currency = ?, theme = ? WHERE id = ?'
  ).run(name.trim(), normalizedEmail, avatar, currency, theme, current.id);

  res.json(toSafeUser(getUserById(current.id)));
});

module.exports = router;
