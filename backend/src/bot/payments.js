'use strict';
const axios = require('axios');
const { helpers } = require('../db/database');
const { sendAdminNotification } = require('./notifications');

const CRYPTOBOT_BASE = 'https://pay.crypt.bot/api';

async function createStarsInvoice(bot, productId, userId, username) {
  const product = await helpers.getProduct(productId);
  if (!product) throw new Error('Produkt nie istnieje');
  const orderId = await helpers.createOrder({
    user_id: String(userId),
    username: username || null,
    product_id: productId,
    payment_method: 'stars',
    amount: product.price_stars,
    currency: 'XTR',
  });
  const payload = JSON.stringify({ order_id: orderId, product_id: productId, user_id: userId });
  const invoiceLink = await bot.telegram.createInvoiceLink({
    title: product.name,
    description: product.description || product.name,
    payload,
    currency: 'XTR',
    prices: [{ label: product.name, amount: product.price_stars }],
  });
  return { invoiceLink, orderId };
}

async function createCryptoInvoice(productId, userId, username, asset) {
  asset = asset || 'USDT';
  const product = await helpers.getProduct(productId);
  if (!product) throw new Error('Produkt nie istnieje');
  const orderId = await helpers.createOrder({
    user_id: String(userId),
    username: username || null,
    product_id: productId,
    payment_method: 'crypto',
    amount: product.price_usdt,
    currency: asset,
  });
  const payload = JSON.stringify({ order_id: orderId });
  const response = await axios.post(
    CRYPTOBOT_BASE + '/createInvoice',
    {
      asset: asset,
      amount: String(product.price_usdt),
      description: product.name,
      payload: payload,
      paid_btn_name: 'callback',
      paid_btn_url: process.env.FRONTEND_URL + '?order=' + orderId + '&status=paid',
      expires_in: 3600,
    },
    { headers: { 'Crypto-Pay-API-Token': process.env.CRYPTOBOT_TOKEN } }
  );
  if (!response.data.ok) throw new Error('CryptoBot error: ' + JSON.stringify(response.data));
  const invoice = response.data.result;
  await helpers.setOrderCryptoBotId(orderId, invoice.invoice_id);
  return { payUrl: invoice.pay_url, invoiceId: invoice.invoice_id, orderId };
}

async function fulfillOrder(bot, orderId) {
  const order = await helpers.getOrder(orderId);
  if (!order) throw new Error('Zamowienie #' + orderId + ' nie istnieje');
  if (order.status === 'fulfilled') {
    console.log('[Payments] Zamowienie #' + orderId + ' juz zrealizowane, pomijam');
    return;
  }
  const account = await helpers.getAvailableAccount(order.product_id);
  if (!account) {
    console.error('[Payments] Brak kont dla produktu ' + order.product_id);
    const adminGroupId = process.env.ADMIN_GROUP_ID;
    if (adminGroupId) {
      await bot.telegram.sendMessage(adminGroupId,
        'WARNING *BRAK KONT!* Brak dostepnych kont dla: *' + order.product_name + '* (Order #' + order.id + ')',
        { parse_mode: 'Markdown' }
      );
    }
    await bot.telegram.sendMessage(order.user_id, 'Przepraszamy, wystapil problem z realizacja. Skontaktuj sie z administratorem.');
    return;
  }
  let credentials;
  try {
    credentials = JSON.parse(helpers.decrypt(account.credentials_encrypted));
  } catch (err) {
    console.error('[Payments] Blad deszyfrowania:', err.message);
    throw err;
  }
  await helpers.markAccountSold(account.id, order.user_id);
  await helpers.updateOrderStatus(orderId, 'fulfilled');
  const msg = 'OK *Dziekujemy za zakup!*\n\n' +
    'BOX *' + order.product_name + '*\n\n' +
    'EMAIL *Email:* `' + credentials.email + '`\n' +
    'LOCK *Haslo:* `' + credentials.password + '`\n' +
    (credentials.note ? 'INFO *Uwaga:* ' + credentials.note + '\n' : '') +
    '\nWARNING _Nie zmieniaj hasla ani danych konta!_\n' +
    'PHONE _W razie problemow napisz do admina_';
  await bot.telegram.sendMessage(order.user_id, msg, { parse_mode: 'Markdown' });
  await sendAdminNotification(bot, order);
  console.log('[Payments] Zamowienie #' + orderId + ' zrealizowane pomyslnie');
}

module.exports = { createStarsInvoice, createCryptoInvoice, fulfillOrder };
