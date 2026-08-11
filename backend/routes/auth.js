const express = require('express');
const db = require('../db');
const { hashPassword, verifyPassword } = require('../lib/password');
const { getUserById, getUserByEmail, toSafeUser } = require('../lib/users');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof email !== 'string' || email.trim().length === 0 ||
    typeof password !== 'string' || password.length < 6
  ) {
    return res.status(400).json({
      error: 'Informe nome, email e senha (mínimo 6 caracteres).',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (getUserByEmail(normalizedEmail)) {
    return res.status(409).json({ error: 'Já existe uma conta com esse email.' });
  }

  const { hash, salt } = hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, password_salt) VALUES (?, ?, ?, ?)')
    .run(name.trim(), normalizedEmail, hash, salt);

  req.session.userId = result.lastInsertRowid;
  res.status(201).json(toSafeUser(getUserById(result.lastInsertRowid)));
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Informe email e senha.' });
  }

  const user = getUserByEmail(email.trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  req.session.userId = user.id;
  res.json(toSafeUser(user));
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const user = getUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  res.json(toSafeUser(user));
});

module.exports = router;
