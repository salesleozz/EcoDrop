const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  // Defaults set to the credentials requested by the user when env vars are absent
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SUA SENHA AQUI',
  // schema.sql creates database named `ecodrop`
  database: process.env.DB_NAME || 'ecodrop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;