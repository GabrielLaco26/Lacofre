const db = require('../db');

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function toSafeUser(user) {
  const { password_hash, password_salt, ...safe } = user;
  return safe;
}

module.exports = { getUserById, getUserByEmail, toSafeUser };
