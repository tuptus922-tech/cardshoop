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

async function handleSeed(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    await seedProductsIfEmpty();
    await ctx.reply('✅ Produkty startowe dodane do bazy!');
  } catch (err) {
    await ctx.reply('Błąd seedowania: ' + err.message);
  }
}

async function handleStock(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    const products = await helpers.getAllProducts();
    if (products.length === 0) {
      return ctx.reply('Brak produktów w bazie. Wpisz /seed aby dodać produkty startowe.');
    }
    let msg = '📦 *Stan magazynu:*\n\n';
    for (const product of products) {
      const count = await helpers.getAvailableAccountCount(product.id);
      const emoji = count === 0 ? '🔴' : count < 3 ? '🟡' : '🟢';
      msg += emoji + ' *' + product.name + '*\n   Kont dostępnych: *' + count + '*\n\n';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[Admin/stock]', err.message);
    await ctx.reply('Blad: ' + err.message);
  }
}

async function handleOrders(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  try {
    const orders = await helpers.getRecentOrders(10);
    if (orders.length === 0) return ctx.reply('Brak zamowien.');
    let msg = '🛒 *Ostatnie 10 zamowien:*\n\n';
    for (const o of orders) {
      const icon = o.status === 'fulfilled' ? '✅' : o.status === 'pending' ? '⏳' : '❌';
      const buyer = o.username ? '@' + o.username : 'ID:' + o.user_id;
      msg += icon + ' #' + o.id + ' - ' + o.product_name + '\n'
           + '   👤 ' + buyer + ' | ' + o.payment_method.toUpperCase() + ' ' + o.amount + ' ' + o.currency + '\n'
           + '   ' + new Date(o.created_at).toLocaleString('pl-PL') + '\n\n';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[Admin/orders]', err.message);
    await ctx.reply('Blad: ' + err.message);
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
    await ctx.reply('Wybierz produkt, do ktorego dodajesz konto:', {
      reply_markup: {
        inline_keyboard: products.map((p) => ([
          { text: p.name, callback_data: 'addacc_' + p.id },
        ])),
      },
    });
  } catch (err) {
    await ctx.reply('Blad: ' + err.message);
  }
}

async function handleProductCallback(ctx, productId) {
  if (!isAdmin(ctx.from.id)) return;
  adminState.set(ctx.from.id, { step: 'enter_email', product_id: Number(productId) });
  await ctx.answerCbQuery('Produkt wybrany!');
  await ctx.reply('✅ Dobra! Teraz wpisz *email* konta (lub wpisz /cancel aby anulowac):', { parse_mode: 'Markdown' });
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
    if (!text.includes('@')) {
      await ctx.reply('To nie wyglada jak email. Sprobuj jeszcze raz:');
      return true;
    }
    adminState.set(ctx.from.id, { ...state, step: 'enter_password', email: text });
    await ctx.reply('🔒 Teraz wpisz *haslo* konta:', { parse_mode: 'Markdown' });
    return true;
  }

  if (state.step === 'enter_password') {
    adminState.set(ctx.from.id, { ...state, step: 'enter_note', password: text });
    await ctx.reply('ℹ️ Opcjonalna *uwaga* (np. nie zmieniaj hasla).\nJesli brak - napisz /skip:', { parse_mode: 'Markdown' });
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
        '✅ *Konto dodane pomyslnie!*\n\n' +
        '📧 Email: `' + state.email + '`\n' +
        '🔒 Haslo: ukryte\n' +
        '📦 Stan magazynu dla tego produktu: *' + count + ' kont*',
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      adminState.delete(ctx.from.id);
      await ctx.reply('Blad zapisu: ' + err.message);
    }
    return true;
  }

  return false;
}

async function handleAdminHelp(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnien.');
  await ctx.reply(
    '🛠 *Panel Admina CardShoop*\n\n' +
    '/addaccount - Dodaj nowe konto do bazy\n' +
    '/stock - Sprawdz stan magazynu\n' +
    '/orders - Ostatnie 10 zamowien\n' +
    '/seed - Dodaj bazowe produkty (Spotify, Netflix...)\n' +
    '/cancel - Anuluj biezaca operacje\n',
    { parse_mode: 'Markdown' }
  );
}

module.exports = {
  isAdmin,
  handleStock,
  handleOrders,
  handleAddAccount,
  handleProductCallback,
  handleAdminText,
  handleAdminHelp,
  handleSeed,
};
