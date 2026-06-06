const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email inválido.' });
    if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email já cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, senha, record) VALUES (?, ?, 0)',
      [email, hash]
    );
    const user = { id: result.insertId, email, record: 0 };
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const [rows] = await pool.query('SELECT id, email, senha, record FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const row = rows[0];
    const ok = await bcrypt.compare(senha, row.senha);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const user = { id: row.id, email: row.email, record: row.record };
    const token = signToken(user);
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao entrar.' });
  }
});

module.exports = router;