'use strict';
const { pool } = require('./database');

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id           SERIAL PRIMARY KEY,
      name         TEXT    NOT NULL,
      category     TEXT    NOT NULL,
      description  TEXT,
      price_stars  INTEGER NOT NULL,
      price_usdt   REAL    NOT NULL,
      image_emoji  TEXT    DEFAULT 'box',
      is_active    INTEGER DEFAULT 1,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id                    SERIAL PRIMARY KEY,
      product_id            INTEGER NOT NULL REFERENCES products(id),
      credentials_encrypted TEXT    NOT NULL,
      is_sold               BOOLEAN DEFAULT false,
      sold_to_user_id       TEXT,
      sold_at               TIMESTAMP,
      created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id                   SERIAL PRIMARY KEY,
      user_id              TEXT    NOT NULL,
      username             TEXT,
      product_id           INTEGER NOT NULL REFERENCES products(id),
      payment_method       TEXT    NOT NULL,
      amount               REAL    NOT NULL,
      currency             TEXT    NOT NULL,
      status               TEXT    NOT NULL DEFAULT 'pending',
      cryptobot_invoice_id INTEGER,
      fulfilled_at         TIMESTAMP,
      created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('[DB] Migracje PostgreSQL wykonane pomyslnie');
}

module.exports = { runMigrations };
