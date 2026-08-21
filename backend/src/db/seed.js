'use strict';
require('dotenv').config();
const { pool } = require('./database');
const { runMigrations } = require('./migrations');

async function seed() {
  await runMigrations();
  await pool.query('UPDATE products SET price_stars = 1');
  console.log('[Seed] Wszystkie ceny ustawione na 1 Stars!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Blad:', err.message);
  process.exit(1);
});
