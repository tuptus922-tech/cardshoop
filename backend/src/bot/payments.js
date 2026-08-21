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
    for(const adminId of adminIds) {
        await bot.telegram.sendMessage(adminId.trim(),
            '⚠️ *BRAK KONT!* Brak dostepnych kont dla: *' + order.product_name + '* (Order #' + order.id + ')',
            { parse_mode: 'Markdown' }
        ).catch(() => {});
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
  const msg = '✅ *Dziekujemy za zakup!*\n\n' +
    '📦 *' + order.product_name + '*\n\n' +
    '📧 *Email:* `' + credentials.email + '`\n' +
    '🔒 *Haslo:* `' + credentials.password + '`\n' +
    (credentials.note ? 'ℹ️ *Uwaga:* ' + credentials.note + '\n' : '') +
    '\n⚠️ _Nie zmieniaj hasla ani danych konta!_\n' +
    '📞 _W razie problemow napisz do admina_';
  await bot.telegram.sendMessage(order.user_id, msg, { parse_mode: 'Markdown' });
  await sendAdminNotification(bot, order);
  console.log('[Payments] Zamowienie #' + orderId + ' zrealizowane pomyslnie');
}

module.exports = { createStarsInvoice, fulfillOrder };
