'use strict';
require('dotenv').config();
const { pool } = require('./database');
const { runMigrations } = require('./migrations');

async function seed() {
  await runMigrations();

  const products = [
    { name: 'Spotify Premium 1M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 1 miesiąc. Bez reklam, tryb offline, wysoka jakość.', price_stars: 120, price_usdt: 1.99, image_emoji: 'music' },
    { name: 'Spotify Premium 3M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 3 miesiące. Oszczędzasz 15%!', price_stars: 310, price_usdt: 4.99, image_emoji: 'music' },
    { name: 'Spotify Premium 6M', category: 'Spotify', description: 'Pełny dostęp Spotify Premium 6 miesięcy. Najlepsza oferta!', price_stars: 580, price_usdt: 8.99, image_emoji: 'music' },
    { name: 'Netflix Standard 1M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 1 miesiąc. Gwarancja braku przerw.', price_stars: 200, price_usdt: 3.49, image_emoji: 'film' },
    { name: 'Netflix Standard 3M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 3 miesiące.', price_stars: 540, price_usdt: 8.99, image_emoji: 'film' },
    { name: 'YouTube Premium 1M', category: 'YouTube', description: 'YouTube bez reklam + YouTube Music przez 1 miesiąc.', price_stars: 150, price_usdt: 2.49, image_emoji: 'tv' },
    { name: 'Discord Nitro 1M (Boost)', category: 'Discord', description: 'Discord Nitro z 2x Server Boost, niestandardowe emoji i 4K streaming.', price_stars: 250, price_usdt: 3.99, image_emoji: 'game' },
    { name: 'Discord Nitro 1 Rok', category: 'Discord', description: 'Discord Nitro na cały rok z 2x Server Boost. Maksymalna oszczędność.', price_stars: 1999, price_usdt: 34.99, image_emoji: 'game' },
  ];

  const countResult = await pool.query('SELECT COUNT(*) as c FROM products');
  if (parseInt(countResult.rows[0].c) === 0) {
    for (const p of products) {
      await pool.query(
        'INSERT INTO products (name, category, description, price_stars, price_usdt, image_emoji) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.category, p.description, p.price_stars, p.price_usdt, p.image_emoji]
      );
    }
    console.log('[Seed] Dodano ' + products.length + ' produktow');
  } else {
    console.log('[Seed] Produkty juz istnieja');
  }

  console.log('[Seed] Gotowe!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Blad:', err.message);
  process.exit(1);
});
