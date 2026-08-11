const express = require('express');
const session = require('express-session');
const path = require('node:path');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    name: 'connect.sid',
    secret: 'lacofre-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);

app.listen(PORT, () => {
  console.log(`Lacofre rodando em http://localhost:${PORT}`);
});
