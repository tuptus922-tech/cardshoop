'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('[DB] Nieoczekiwany blad polaczenia:', err.message);
});

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(data) {
  const parts = data.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

const helpers = {
  // Tylko produkty z dostepnymi kontami (> 0)
  async getInStockProducts() {
    const r = await query(`
      SELECT p.*, COUNT(a.id)::int as stock
      FROM products p
      INNER JOIN accounts a ON a.product_id = p.id AND a.is_sold = false
      WHERE p.is_active = 1
      GROUP BY p.id
      HAVING COUNT(a.id) > 0
      ORDER BY p.category, p.price_stars
    `);
    return r.rows;
  },

  async getAllProducts() {
    const r = await query('SELECT * FROM products WHERE is_active = 1 ORDER BY category, price_stars');
    return r.rows;
  },

  async getProduct(id) {
    const r = await query('SELECT * FROM products WHERE id = $1', [id]);
    return r.rows[0] || null;
  },

  async createOrder(data) {
    const r = await query(
      `INSERT INTO orders (user_id, username, product_id, payment_method, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
      [data.user_id, data.username, data.product_id, data.payment_method, data.amount, data.currency]
    );
    return r.rows[0].id;
  },

  async getOrder(id) {
    const r = await query(
      `SELECT o.*, p.name as product_name, p.category
       FROM orders o JOIN products p ON o.product_id = p.id
       WHERE o.id = $1`,
      [id]
    );
    return r.rows[0] || null;
  },

  async updateOrderStatus(id, status) {
    await query(
      'UPDATE orders SET status = $1, fulfilled_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
  },

  async getAvailableAccount(productId) {
    const r = await query(
      'SELECT * FROM accounts WHERE product_id = $1 AND is_sold = false LIMIT 1',
      [productId]
    );
    return r.rows[0] || null;
  },

  async markAccountSold(accountId, userId) {
    await query(
      'UPDATE accounts SET is_sold = true, sold_to_user_id = $1, sold_at = CURRENT_TIMESTAMP WHERE id = $2',
      [userId, accountId]
    );
  },

  async getAvailableAccountCount(productId) {
    const r = await query(
      'SELECT COUNT(*) as c FROM accounts WHERE product_id = $1 AND is_sold = false',
      [productId]
    );
    return parseInt(r.rows[0].c, 10);
  },

  async addAccount(productId, credentialsEncrypted) {
    await query(
      'INSERT INTO accounts (product_id, credentials_encrypted) VALUES ($1, $2)',
      [productId, credentialsEncrypted]
    );
  },

  async getRecentOrders(limit) {
    const r = await query(
      `SELECT o.*, p.name as product_name
       FROM orders o JOIN products p ON o.product_id = p.id
       WHERE o.payment_method = 'stars' AND o.status IN ('fulfilled', 'paid')
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit || 10]
    );
    return r.rows;
  },

  // Statystyki zarobkow i sprzedazy (dla adminow)
  async getStats() {
    const totalQuery = await query(`
      SELECT 
        COUNT(*)::int as total_orders,
        COALESCE(SUM(amount), 0)::int as total_stars
      FROM orders 
      WHERE payment_method = 'stars' AND status IN ('fulfilled', 'paid')
    `);

    const todayQuery = await query(`
      SELECT 
        COUNT(*)::int as today_orders,
        COALESCE(SUM(amount), 0)::int as today_stars
      FROM orders 
      WHERE payment_method = 'stars' 
        AND status IN ('fulfilled', 'paid')
        AND created_at::date = CURRENT_DATE
    `);

    const accountsQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_sold = false)::int as in_stock,
        COUNT(*) FILTER (WHERE is_sold = true)::int as sold
      FROM accounts
    `);

    return {
      totalOrders: totalQuery.rows[0].total_orders,
      totalStars: totalQuery.rows[0].total_stars,
      todayOrders: todayQuery.rows[0].today_orders,
      todayStars: todayQuery.rows[0].today_stars,
      inStock: accountsQuery.rows[0].in_stock,
      sold: accountsQuery.rows[0].sold,
    };
  },

  encrypt,
  decrypt,
};

module.exports = { pool, helpers };
