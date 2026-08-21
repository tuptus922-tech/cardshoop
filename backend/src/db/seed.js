'use strict';
require('dotenv').config();
const { pool, helpers } = require('./database');
const { runMigrations } = require('./migrations');

async function seed() {
  await runMigrations();

  const products = [
    { name: 'Spotify Premium 1M', category: 'Spotify', description: 'Pelny dostep Spotify Premium 1 miesiac. Bez reklam, offline, wysoka jakosc.', price_stars: 120, price_usdt: 1.99, image_emoji: 'music' },
    { name: 'Spotify Premium 3M', category: 'Spotify', description: 'Pelny dostep Spotify Premium 3 miesiace. Oszczedzasz 15%!', price_stars: 310, price_usdt: 4.99, image_emoji: 'music' },
    { name: 'Spotify Premium 6M', category: 'Spotify', description: 'Pelny dostep Spotify Premium 6 miesiecy. Najlepsza oferta!', price_stars: 580, price_usdt: 8.99, image_emoji: 'music' },
    { name: 'Netflix Standard 1M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 1 miesiac.', price_stars: 200, price_usdt: 3.49, image_emoji: 'film' },
    { name: 'Netflix Standard 3M', category: 'Netflix', description: 'Netflix Full HD, 2 ekrany przez 3 miesiace.', price_stars: 540, price_usdt: 8.99, image_emoji: 'film' },
    { name: 'YouTube Premium 1M', category: 'YouTube', description: 'YouTube bez reklam + Music przez 1 miesiac.', price_stars: 150, price_usdt: 2.49, image_emoji: 'tv' },
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
    console.log('[Seed] Produkty juz istnieja, pomijam');
  }

  console.log('[Seed] Gotowe!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Blad:', err.message);
  process.exit(1);
});
