'use strict';
const { helpers } = require('../db/database');
const { seedProductsIfEmpty } = require('../db/migrations');

const adminState = new Map();

function getAdminIds() {
  const raw = process.env.ADMIN_IDS || process.env.ADMIN_GROUP_ID || '';
  return raw.split(',').map((id) => id.trim()).filter(Boolean);
}

function isAdmin(userId) {
  return getAdminIds().includes(String(userId));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function handleSeed(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    await seedProductsIfEmpty();
    await ctx.reply('✅ Produkty startowe dodane do bazy!');
  } catch (err) {
    await ctx.reply('Błąd seedowania: ' + err.message);
  }
}

// /stats i /balance - Zarobki i statystyki dla każdego admina
async function handleStats(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnień.');
  try {
    const stats = await helpers.getStats();
    const msg =
      '📊 <b>Statystyki i Zarobki CardShoop:</b>\n\n' +
      `⭐️ <b>Łączny zarobek:</b> <b>${stats.totalStars} Stars</b>\n` +
      `🛒 <b>Wszystkie zamówienia:</b> <b>${stats.totalOrders} szt.</b>\n\n` +
      `📅 <b>Dzisiaj zarobiono:</b> <b>${stats.todayStars} Stars</b> (${stats.todayOrders} zamówień)\n\n` +
      `📦 <b>Konta w magazynie (dostępne):</b> <b>${stats.inStock} szt.</b>\n` +
      `✅ <b>Konta sprzedane łącznie:</b> <b>${stats.sold} szt.</b>`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Admin/stats]', err.message);
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleStock(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    const products = await helpers.getAllProducts();
    if (products.length === 0) {
      return ctx.reply('Brak produktów w bazie. Wpisz /seed aby dodać produkty startowe.');
    }
    let msg = '📦 <b>Stan magazynu:</b>\n\n';
    for (const product of products) {
      const count = await helpers.getAvailableAccountCount(product.id);
      const emoji = count === 0 ? '🔴' : count < 3 ? '🟡' : '🟢';
      msg += `${emoji} <b>${escapeHtml(product.name)}</b>\n   Kont dostępnych: <b>${count}</b>\n\n`;
    }
    await ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Admin/stock]', err.message);
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleOrders(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    const orders = await helpers.getRecentOrders(15);
    if (orders.length === 0) {
      return ctx.reply('Brak opłaconych zamówień w bazie.');
    }

    let msg = '⭐ <b>Ostatnie opłacone zamówienia (Telegram Stars):</b>\n\n';
    for (const o of orders) {
      const buyer = o.username ? '@' + o.username : 'ID: ' + o.user_id;
      const date = new Date(o.created_at).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
      msg += `⭐ <b>#${o.id} - ${escapeHtml(o.product_name)}</b>\n`
           + `   👤 <b>Kupujący:</b> ${escapeHtml(buyer)}\n`
           + `   💰 <b>Kwota:</b> ${o.amount} Stars\n`
           + `   📅 <b>Data:</b> ${date}\n`
           + `   ✅ <b>Status:</b> Zrealizowane\n\n`;
    }
    await ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Admin/orders]', err.message);
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleAddAccount(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    let products = await helpers.getAllProducts();
    if (products.length === 0) {
      await seedProductsIfEmpty();
      products = await helpers.getAllProducts();
    }

    adminState.set(ctx.from.id, { step: 'select_product' });
    await ctx.reply('Wybierz produkt, do którego dodajesz konto:', {
      reply_markup: {
        inline_keyboard: products.map((p) => ([
          { text: p.name, callback_data: 'addacc_' + p.id },
        ])),
      },
    });
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleProductCallback(ctx, productId) {
  if (!isAdmin(ctx.from.id)) return;
  adminState.set(ctx.from.id, { step: 'enter_email', product_id: Number(productId) });
  await ctx.answerCbQuery('Produkt wybrany!');
  await ctx.reply('✅ Dobra! Teraz wpisz <b>email / login</b> konta (lub wpisz /cancel aby anulować):', { parse_mode: 'HTML' });
}

async function handleAdminText(ctx) {
  if (!isAdmin(ctx.from.id)) return false;
  const state = adminState.get(ctx.from.id);
  if (!state) return false;

  const text = ctx.message.text.trim();

  if (text === '/cancel') {
    adminState.delete(ctx.from.id);
    await ctx.reply('Anulowano dodawanie konta.');
    return true;
  }

  if (state.step === 'enter_email') {
    adminState.set(ctx.from.id, { ...state, step: 'enter_password', email: text });
    await ctx.reply('🔒 Teraz wpisz <b>hasło</b> konta:', { parse_mode: 'HTML' });
    return true;
  }

  if (state.step === 'enter_password') {
    adminState.set(ctx.from.id, { ...state, step: 'enter_note', password: text });
    await ctx.reply('ℹ️ Opcjonalna <b>uwaga</b> (np. profil 2, nie zmieniać hasła).\nJeśli brak - napisz /skip:', { parse_mode: 'HTML' });
    return true;
  }

  if (state.step === 'enter_note') {
    const note = (text === '/skip') ? '' : text;
    try {
      const credentials = JSON.stringify({
        email: state.email,
        password: state.password,
        note: note,
      });
      await helpers.addAccount(state.product_id, helpers.encrypt(credentials));
      adminState.delete(ctx.from.id);
      const count = await helpers.getAvailableAccountCount(state.product_id);
      await ctx.reply(
        '✅ <b>Konto dodane pomyślnie!</b>\n\n' +
        '📧 Login: <code>' + escapeHtml(state.email) + '</code>\n' +
        '🔒 Hasło: [zapisane bezpiecznie]\n' +
        '📦 Stan magazynu dla tego produktu: <b>' + count + ' kont</b>',
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      adminState.delete(ctx.from.id);
      await ctx.reply('Błąd zapisu: ' + err.message);
    }
    return true;
  }

  return false;
}

async function handleAdminHelp(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  await ctx.reply(
    '🛠 <b>Panel Admina CardShoop</b>\n\n' +
    '/stats - Statystyki i łączne zarobki bota (Stars)\n' +
    '/stock - Stan magazynu (dostępne konta)\n' +
    '/orders - Ostatnie opłacone zamówienia\n' +
    '/addaccount - Dodaj nowe konto do bazy\n' +
    '/seed - Dodaj bazowe produkty\n' +
    '/cancel - Anuluj bieżącą operację\n',
    { parse_mode: 'HTML' }
  );
}

module.exports = {
  isAdmin,
  handleStats,
  handleStock,
  handleOrders,
  handleAddAccount,
  handleProductCallback,
  handleAdminText,
  handleAdminHelp,
  handleSeed,
};
