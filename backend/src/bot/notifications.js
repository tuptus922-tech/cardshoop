'use strict';

function getAdminIds() {
  const raw = process.env.ADMIN_IDS || process.env.ADMIN_GROUP_ID || '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendAdminNotification(bot, order) {
  const adminIds = getAdminIds();

  if (adminIds.length === 0) {
    console.warn('[Notifications] Brak adminow w ADMIN_IDS!');
    return;
  }

  const currencyLabel = order.amount + ' ' + (order.currency === 'XTR' ? 'Stars ⭐' : order.currency);
  const usernameLabel = order.username ? '@' + escapeHtml(order.username) : 'ID: ' + order.user_id;
  const now = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

  const message =
    '🛒 <b>Nowe zamówienie w CardShoop!</b>\n\n' +
    '📦 <b>Produkt:</b> ' + escapeHtml(order.product_name) + '\n' +
    '⭐ <b>Płatność:</b> ' + currencyLabel + '\n' +
    '👤 <b>Kupujący:</b> ' + usernameLabel + '\n' +
    '🆔 <b>Order ID:</b> #' + order.id + '\n' +
    '📅 <b>Data:</b> ' + now + '\n\n' +
    '✅ <b>Status:</b> Zrealizowane automatycznie\n' +
    '🔑 Dane do konta zostały wysłane do kupującego';

  for (const adminId of adminIds) {
    try {
      await bot.telegram.sendMessage(adminId, message, { parse_mode: 'HTML' });
      console.log('[Notifications] Wysłano do admina ' + adminId + ' (order #' + order.id + ')');
    } catch (err) {
      console.error('[Notifications] Błąd dla admina ' + adminId + ':', err.message);
    }
  }
}

module.exports = { sendAdminNotification };
