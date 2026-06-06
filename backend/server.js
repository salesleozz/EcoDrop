const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

async function ensureDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, { encoding: 'utf8' });

    // Connect without specifying a database so we can create it if missing
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'SUA SENHA AQUI',
      multipleStatements: true,
    });

    await conn.query(sql);
    await conn.end();
    console.log('✅ Banco de dados verificado/carregado a partir de schema.sql');
  } catch (err) {
    console.error('Erro ao aplicar schema.sql:', err);
    throw err;
  }
}

async function start() {
  try {
    await ensureDatabase();

    // now require routes (they import the DB pool) after DB exists
    const authRoutes = require('./routes/auth');
    const scoreRoutes = require('./routes/score');

    app.use('/api/auth', authRoutes);
    app.use('/api/score', scoreRoutes);

    app.use((err, _req, res, _next) => {
      console.error(err);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🌱 EcoDrop API ouvindo em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar a API:', err);
    process.exit(1);
  }
}

start();
