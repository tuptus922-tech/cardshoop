'use strict';
const express = require('express');
const crypto = require('crypto');
const { createStarsInvoice } = require('../bot/payments');
const { helpers } = require('../db/database');

const router = express.Router();

function validateInitData(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  if (!initData) return res.status(401).json({ ok: false, error: 'Brak initData' });
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => k + '=' + v)
      .join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    if (computedHash !== hash) return res.status(401).json({ ok: false, error: 'Nieprawidlowy initData' });
    const userStr = urlParams.get('user');
    req.telegramUser = userStr ? JSON.parse(userStr) : null;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Blad walidacji initData' });
  }
}

function maybeValidate(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    req.telegramUser = { id: 0, username: 'dev_user', first_name: 'Dev' };
    return next();
  }
  return validateInitData(req, res, next);
}

router.post('/stars', maybeValidate, async (req, res) => {
  const bot = req.app.get('bot');
  const { product_id } = req.body;
  const user = req.telegramUser;
  if (!product_id) return res.status(400).json({ ok: false, error: 'Brak product_id' });
  try {
    const { invoiceLink, orderId } = await createStarsInvoice(bot, Number(product_id), user.id, user.username);
    res.json({ ok: true, invoice_link: invoiceLink, order_id: orderId });
  } catch (err) {
    console.error('[API/invoices/stars]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/order/:id', async (req, res) => {
  try {
    const order = await helpers.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ ok: false, error: 'Zamowienie nie istnieje' });
    res.json({ ok: true, result: { id: order.id, status: order.status, product_name: order.product_name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
