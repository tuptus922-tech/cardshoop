'use strict';
const { pool } = require('./database');

const INITIAL_PRODUCTS = [
  { name: 'Spotify Premium 1M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 1 miesiąc. Bez reklam, tryb offline, wysoka jakość.', price_stars: 120, price_usdt: 1.99, image_emoji: 'music' },
  { name: 'Spotify Premium 3M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 3 miesiące. Oszczędzasz 15%!', price_stars: 310, price_usdt: 4.99, image_emoji: 'music' },
  { name: 'Spotify Premium 6M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 6 miesięcy. Najlepsza oferta!', price_stars: 580, price_usdt: 8.99, image_emoji: 'music' },
  { name: 'Netflix Standard 1M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 1 miesiąc. Gwarancja braku przerw.', price_stars: 200, price_usdt: 3.49, image_emoji: 'film' },
  { name: 'Netflix Standard 3M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 3 miesiące.', price_stars: 540, price_usdt: 8.99, image_emoji: 'film' },
  { name: 'YouTube Premium 1M', category: 'YouTube', description: 'YouTube bez reklam + YouTube Music przez 1 miesiąc.', price_stars: 150, price_usdt: 2.49, image_emoji: 'tv' },
  { name: 'Discord Nitro 1M (Boost)', category: 'Discord', description: 'Discord Nitro z 2x Server Boost, niestandardowe emoji i 4K streaming.', price_stars: 250, price_usdt: 3.99, image_emoji: 'game' },
  { name: 'Discord Nitro 1 Rok', category: 'Discord', description: 'Discord Nitro na cały rok z 2x Server Boost. Maksymalna oszczędność.', price_stars: 1999, price_usdt: 34.99, image_emoji: 'game' },
];

async function seedProductsIfEmpty() {
  const countResult = await pool.query('SELECT COUNT(*) as c FROM products');
  if (parseInt(countResult.rows[0].c, 10) === 0) {
    for (const p of INITIAL_PRODUCTS) {
      await pool.query(
        'INSERT INTO products (name, category, description, price_stars, price_usdt, image_emoji) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.category, p.description, p.price_stars, p.price_usdt, p.image_emoji]
      );
    }
    console.log('[DB] Automatycznie dodano ' + INITIAL_PRODUCTS.length + ' produktow startowych');
  }
}

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
  await seedProductsIfEmpty();
}

module.exports = { runMigrations, seedProductsIfEmpty };
