'use strict';
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { fulfillOrder } = require('./payments');
const {
  handleStock,
  handleOrders,
  handleAddAccount,
  handleProductCallback,
  handleAdminText,
  handleAdminHelp,
  handleSeed,
} = require('./admin');

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- START ---
bot.start(async (ctx) => {
  const firstName = (ctx.from && ctx.from.first_name) || 'uzytkownik';
  await ctx.reply(
    '👋 Czesc, *' + firstName + '*!\n\nWitaj w *CardShoop* - sklepie z dostepami do kont premium.\n\nNacisnij przycisk ponizej, aby otworzyc sklep 🛒',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{
          text: '🛒 Otworz Sklep',
          web_app: { url: process.env.FRONTEND_URL },
        }]],
      },
    }
  );
});

// --- ADMIN COMMANDS ---
bot.command('addaccount', handleAddAccount);
bot.command('stock', handleStock);
bot.command('orders', handleOrders);
bot.command('seed', handleSeed);
bot.command('help', handleAdminHelp);

// --- CALLBACK QUERIES (przyciski) ---
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data && data.startsWith('addacc_')) {
    const productId = data.replace('addacc_', '');
    await handleProductCallback(ctx, productId);
  }
});

// --- STARS PRE-CHECKOUT ---
bot.on('pre_checkout_query', async (ctx) => {
  try {
    const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
    const { helpers } = require('../db/database');
    const product = await helpers.getProduct(payload.product_id);
    if (product && product.is_active) {
      await ctx.answerPreCheckoutQuery(true);
    } else {
      await ctx.answerPreCheckoutQuery(false, 'Produkt jest niedostepny.');
    }
  } catch (err) {
    console.error('[Bot] pre_checkout_query error:', err.message);
    await ctx.answerPreCheckoutQuery(false, 'Blad systemu.');
  }
});

// --- STARS SUCCESSFUL PAYMENT ---
bot.on('successful_payment', async (ctx) => {
  try {
    const payload = JSON.parse(ctx.message.successful_payment.invoice_payload);
    const orderId = payload.order_id;
    console.log('[Bot] Stars payment received for order #' + orderId);
    const { helpers } = require('../db/database');
    await helpers.updateOrderStatus(orderId, 'paid');
    await fulfillOrder(bot, orderId);
  } catch (err) {
    console.error('[Bot] successful_payment error:', err.message);
    await ctx.reply('Blad podczas realizacji zamowienia. Skontaktuj sie z administratorem.');
  }
});

// --- WIADOMOSCI TEKSTOWE (admin flow) ---
bot.on('text', async (ctx) => {
  const handled = await handleAdminText(ctx);
  // jesli nie admin lub nie w toku operacji - ignoruj
});

bot.catch((err, ctx) => {
  console.error('[Bot] Error for ' + ctx.updateType + ':', err.message);
});

module.exports = bot;
