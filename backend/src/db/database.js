'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

// Polaczenie z Supabase przez DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('[DB] Nieoczekiwany blad polaczenia:', err.message);
});

// ------------------------------------------------
// AES-256-GCM szyfrowanie (niezmienione)
// ------------------------------------------------
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

// Pomocniczy wrapper
async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// ------------------------------------------------
// Helpers - wszystkie sa teraz async!
// ------------------------------------------------
const helpers = {
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

  async getOrderByCryptoBotId(invoiceId) {
    const r = await query(
      `SELECT o.*, p.name as product_name, p.category
       FROM orders o JOIN products p ON o.product_id = p.id
       WHERE o.cryptobot_invoice_id = $1`,
      [invoiceId]
    );
    return r.rows[0] || null;
  },

  async setOrderCryptoBotId(orderId, invoiceId) {
    await query('UPDATE orders SET cryptobot_invoice_id = $1 WHERE id = $2', [invoiceId, orderId]);
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

  // Ile kont dostepnych dla danego produktu
  async getAvailableAccountCount(productId) {
    const r = await query(
      'SELECT COUNT(*) as c FROM accounts WHERE product_id = $1 AND is_sold = false',
      [productId]
    );
    return parseInt(r.rows[0].c);
  },

  // Dodaj nowe konto (przez admina)
  async addAccount(productId, credentialsEncrypted) {
    await query(
      'INSERT INTO accounts (product_id, credentials_encrypted) VALUES ($1, $2)',
      [productId, credentialsEncrypted]
    );
  },

  // Ostatnie N zamowien (dla panelu admina)
  async getRecentOrders(limit) {
    const r = await query(
      `SELECT o.*, p.name as product_name
       FROM orders o JOIN products p ON o.product_id = p.id
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit || 10]
    );
    return r.rows;
  },

  encrypt,
  decrypt,
};

module.exports = { pool, helpers };
