const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

router.get('/me', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT id, email, record FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: rows[0] });
});

router.post('/submit', auth, async (req, res) => {
  const score = Number(req.body?.score);
  if (!Number.isFinite(score) || score < 0) return res.status(400).json({ error: 'Pontuação inválida.' });

  const [rows] = await pool.query('SELECT record FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const current = rows[0].record || 0;
  const isRecord = score > current;
  if (isRecord) {
    await pool.query('UPDATE users SET record = ? WHERE id = ?', [score, req.user.id]);
  }
  res.json({ isRecord, record: isRecord ? score : current });
});

module.exports = router;