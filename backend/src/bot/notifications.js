'use strict';

/**
 * Parsuje ADMIN_IDS z .env (oddzielone przecinkiem)
 * Przyklad: "8534522754,987654321"
 */
function getAdminIds() {
  const raw = process.env.ADMIN_IDS || process.env.ADMIN_GROUP_ID || '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

/**
 * Wysyla powiadomienie o nowym zamowieniu do wszystkich adminow.
 * Kazdy admin dostaje osobna wiadomosc prywatna od bota.
 */
async function sendAdminNotification(bot, order) {
  const adminIds = getAdminIds();

  if (adminIds.length === 0) {
    console.warn('[Notifications] Brak adminow w ADMIN_IDS!');
    return;
  }

  const paymentIcon = order.payment_method === 'stars' ? '\u2b50' : '\ud83d\udcb0';
  const currencyLabel = order.payment_method === 'stars'
    ? order.amount + ' Stars'
    : order.amount + ' ' + order.currency;
  const usernameLabel = order.username
    ? '@' + order.username
    : 'ID: ' + order.user_id;
  const now = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

  const message =
    '\ud83d\uded2 *Nowe zamowienie!*\n\n' +
    '\ud83d\udce6 *Produkt:* ' + order.product_name + '\n' +
    paymentIcon + ' *Platnosc:* ' + currencyLabel +
      ' (' + (order.payment_method === 'stars' ? 'Telegram Stars' : 'Kryptowaluta') + ')\n' +
    '\ud83d\udc64 *Kupujacy:* ' + usernameLabel + '\n' +
    '\ud83c\udd94 *Order ID:* #' + order.id + '\n' +
    '\ud83d\udcc5 *Data:* ' + now + '\n\n' +
    '\u2705 *Status:* Zrealizowane\n' +
    '\ud83d\udd11 Dane konta wyslane do kupujacego';

  // Wyslij do kazdego admina
  for (const adminId of adminIds) {
    try {
      await bot.telegram.sendMessage(adminId, message, { parse_mode: 'Markdown' });
      console.log('[Notifications] Wyslano do admina ' + adminId + ' (order #' + order.id + ')');
    } catch (err) {
      console.error('[Notifications] Blad dla admina ' + adminId + ':', err.message);
    }
  }
}

module.exports = { sendAdminNotification };
