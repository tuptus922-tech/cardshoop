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

// /price - Zmiana ceny produktu
async function handlePrice(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnień.');
  try {
    const products = await helpers.getAllProducts();
    if (products.length === 0) {
      return ctx.reply('Brak produktów w bazie. Wpisz /seed aby dodać produkty startowe.');
    }

    await ctx.reply('Wybierz produkt, którego cenę chcesz zmienić:', {
      reply_markup: {
        inline_keyboard: products.map((p) => ([
          { text: `${p.name} (${p.price_stars} Stars)`, callback_data: 'setprice_' + p.id },
        ])),
      },
    });
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handlePriceCallback(ctx, productId) {
  if (!isAdmin(ctx.from.id)) return;
  try {
    const product = await helpers.getProduct(Number(productId));
    if (!product) return ctx.reply('Produkt nie istnieje.');

    adminState.set(ctx.from.id, { step: 'enter_price', product_id: product.id, product_name: product.name });
    await ctx.answerCbQuery();
    await ctx.reply(
      `Wpisz nową cenę w <b>Telegram Stars</b> dla <b>${escapeHtml(product.name)}</b> (aktualnie: <code>${product.price_stars} Stars</code>):\n\n<i>Np. wpisz 150 lub /cancel aby anulować</i>`,
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

// /delaccount lub /deleteaccount - Usuwanie kont z magazynu
async function handleDelAccount(ctx) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Brak uprawnień.');
  try {
    const products = await helpers.getAllProducts();
    const inStockList = [];

    for (const p of products) {
      const count = await helpers.getAvailableAccountCount(p.id);
      if (count > 0) {
        inStockList.push({ ...p, count });
      }
    }

    if (inStockList.length === 0) {
      return ctx.reply('📦 Magazyn jest pusty – brak niesprzedanych kont do usunięcia.');
    }

    await ctx.reply('Wybierz produkt, z którego chcesz usunąć konta:', {
      reply_markup: {
        inline_keyboard: inStockList.map((p) => ([
          { text: `${p.name} (${p.count} w magazynie)`, callback_data: 'delacc_prod_' + p.id },
        ])),
      },
    });
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleDelProductCallback(ctx, productId) {
  if (!isAdmin(ctx.from.id)) return;
  try {
    const product = await helpers.getProduct(Number(productId));
    if (!product) return ctx.reply('Produkt nie istnieje.');

    const accounts = await helpers.getAvailableAccountsList(product.id);
    if (accounts.length === 0) {
      await ctx.answerCbQuery('Brak kont w magazynie.');
      return ctx.reply(`Dla ${product.name} brak dostępnych kont w magazynie.`);
    }

    await ctx.answerCbQuery();

    const buttons = accounts.map((acc) => ([
      { text: `🗑 Usuń: ${acc.email} (#${acc.id})`, callback_data: 'delacc_item_' + acc.id },
    ]));

    buttons.push([
      { text: `💥 Wyczyść WSZYSTKIE (${accounts.length} kont)`, callback_data: 'delacc_all_' + product.id },
    ]);

    await ctx.reply(
      `📦 <b>Zarządzanie magazynem dla: ${escapeHtml(product.name)}</b>\n\nWybierz konto, które chcesz usunąć:`,
      {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      }
    );
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

async function handleDeleteSpecificAccount(ctx, accountId) {
  if (!isAdmin(ctx.from.id)) return;
  try {
    const deleted = await helpers.deleteAccountById(Number(accountId));
    await ctx.answerCbQuery('Konto usunięte!');
    if (deleted) {
      const remaining = await helpers.getAvailableAccountCount(deleted.product_id);
      await ctx.reply(
        `✅ <b>Konto #${accountId} zostało trwale usunięte z magazynu!</b>\nPozostało dostępnych kont: <b>${remaining} szt.</b>`,
        { parse_mode: 'HTML' }
      );
    } else {
      await ctx.reply('Konto nie zostało znalezione lub zostało już sprzedane.');
    }
  } catch (err) {
    await ctx.reply('Błąd usuwania: ' + err.message);
  }
}

async function handleClearAllAccounts(ctx, productId) {
  if (!isAdmin(ctx.from.id)) return;
  try {
    const product = await helpers.getProduct(Number(productId));
    const count = await helpers.clearAllAvailableAccountsForProduct(Number(productId));
    await ctx.answerCbQuery('Magazyn wyczyszczony!');
    await ctx.reply(
      `✅ <b>Wyczyszczono wszystkie konta (${count} szt.) dla ${escapeHtml(product ? product.name : 'produktu')}!</b>\nStan magazynu: 0 kont (produkt ukryty w sklepie).`,
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    await ctx.reply('Błąd: ' + err.message);
  }
}

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
      msg += `${emoji} <b>${escapeHtml(product.name)}</b> (${product.price_stars} Stars)\n   Kont dostępnych: <b>${count}</b>\n\n`;
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
          { text: `${p.name} (${p.price_stars} Stars)`, callback_data: 'addacc_' + p.id },
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
    await ctx.reply('Anulowano operację.');
    return true;
  }

  // Obsluga zmiany ceny (/price)
  if (state.step === 'enter_price') {
    const newPrice = parseInt(text, 10);
    if (isNaN(newPrice) || newPrice <= 0) {
      await ctx.reply('Cena musi być liczbą całkowitą większą od zera (np. 120). Spróbuj ponownie:');
      return true;
    }

    try {
      await helpers.updateProductPrice(state.product_id, newPrice);
      adminState.delete(ctx.from.id);
      await ctx.reply(
        `✅ <b>Cena zaktualizowana pomyślnie!</b>\n\nProdukt: <b>${escapeHtml(state.product_name)}</b>\nNowa cena: <b>${newPrice} Telegram Stars</b> ⭐`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      adminState.delete(ctx.from.id);
      await ctx.reply('Błąd aktualizacji ceny: ' + err.message);
    }
    return true;
  }

  // Obsluga dodawania konta (/addaccount)
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
    '/price - Zmień cenę produktu (w Stars)\n' +
    '/stock - Stan magazynu (dostępne konta)\n' +
    '/addaccount - Dodaj nowe konto do bazy\n' +
    '/delaccount - Usuń konto z magazynu\n' +
    '/orders - Ostatnie opłacone zamówienia\n' +
    '/stats - Statystyki i łączne zarobki bota\n' +
    '/seed - Dodaj bazowe produkty\n' +
    '/cancel - Anuluj bieżącą operację\n',
    { parse_mode: 'HTML' }
  );
}

module.exports = {
  isAdmin,
  handlePrice,
  handlePriceCallback,
  handleDelAccount,
  handleDelProductCallback,
  handleDeleteSpecificAccount,
  handleClearAllAccounts,
  handleStats,
  handleStock,
  handleOrders,
  handleAddAccount,
  handleProductCallback,
  handleAdminText,
  handleAdminHelp,
  handleSeed,
};
