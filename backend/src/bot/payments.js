'use strict';
const { helpers } = require('../db/database');
const { sendAdminNotification } = require('./notifications');

async function createStarsInvoice(bot, productId, userId, username) {
  const product = await helpers.getProduct(productId);
  if (!product) throw new Error('Produkt nie istnieje');

  const orderId = await helpers.createOrder({
    user_id: String(userId),
    username: username || null,
    product_id: productId,
    payment_method: 'stars',
    amount: Math.round(product.price_stars),
    currency: 'XTR',
  });

  const payload = JSON.stringify({ order_id: orderId, product_id: productId, user_id: String(userId) });

  const invoiceLink = await bot.telegram.createInvoiceLink({
    title: product.name.slice(0, 32),
    description: (product.description || product.name).slice(0, 255),
    payload: payload,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: product.name.slice(0, 32), amount: Math.round(product.price_stars) }],
  });

  return { invoiceLink, orderId };
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
    const adminIds = (process.env.ADMIN_IDS || '').split(',').filter(Boolean);
    for (const adminId of adminIds) {
      await bot.telegram.sendMessage(
        adminId.trim(),
        `⚠️ <b>BRAK KONT!</b> Brak dostępnych kont dla: <b>${order.product_name}</b> (Order #${order.id})`,
        { parse_mode: 'HTML' }
      ).catch(() => {});
    }
    await bot.telegram.sendMessage(
      order.user_id,
      'Przepraszamy, wystąpił problem z realizacją zamówienia (brak dostępnego konta w magazynie). Skontaktuj się z administratorem.'
    );
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

  const msg =
    '✅ <b>Dziękujemy za zakup!</b>\n\n' +
    '📦 <b>' + order.product_name + '</b>\n\n' +
    '📧 <b>Email / Login:</b> <code>' + credentials.email + '</code>\n' +
    '🔒 <b>Hasło:</b> <code>' + credentials.password + '</code>\n' +
    (credentials.note ? 'ℹ️ <b>Uwaga:</b> ' + credentials.note + '\n' : '') +
    '\n⚠️ <i>Nie zmieniaj hasła ani danych konta!</i>\n' +
    '📞 <i>W razie problemów napisz do administratora.</i>';

  await bot.telegram.sendMessage(order.user_id, msg, { parse_mode: 'HTML' });
  await sendAdminNotification(bot, order);
  console.log('[Payments] Zamowienie #' + orderId + ' zrealizowane pomyslnie');
}

module.exports = { createStarsInvoice, fulfillOrder };
