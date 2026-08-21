'use strict';
const express = require('express');
const crypto = require('crypto');
const { createStarsInvoice } = require('../bot/payments');
const { helpers } = require('../db/database');

const router = express.Router();

function validateInitData(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  if (!initData) {
    return res.status(401).json({ ok: false, error: 'Brak autoryzacji Telegram (otwórz w aplikacji Telegram)' });
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const userStr = urlParams.get('user');
    const parsedUser = userStr ? JSON.parse(userStr) : null;

    if (!hash) {
      req.telegramUser = parsedUser || { id: '0', username: 'anonymous' };
      return next();
    }

    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => k + '=' + v)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) {
      console.warn('[API/invoices] Błędny hash initData');
      return res.status(401).json({ ok: false, error: 'Błąd weryfikacji tożsamości Telegram' });
    }

    req.telegramUser = parsedUser;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Błąd walidacji initData: ' + err.message });
  }
}

router.post('/stars', validateInitData, async (req, res) => {
  const bot = req.app.get('bot');
  const { product_id } = req.body;
  const user = req.telegramUser || {};

  if (!product_id) {
    return res.status(400).json({ ok: false, error: 'Brak parametru product_id' });
  }

  try {
    const { invoiceLink, orderId } = await createStarsInvoice(
      bot,
      Number(product_id),
      user.id || '0',
      user.username || user.first_name || null
    );

    res.json({ ok: true, invoice_link: invoiceLink, order_id: orderId });
  } catch (err) {
    console.error('[API/invoices/stars] Błąd:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/order/:id', async (req, res) => {
  try {
    const order = await helpers.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ ok: false, error: 'Zamówienie nie istnieje' });
    res.json({ ok: true, result: { id: order.id, status: order.status, product_name: order.product_name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
