'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const bot = require('./bot/index');
const { runMigrations } = require('./db/migrations');
const productsRouter = require('./api/products');
const invoicesRouter = require('./api/invoices');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));

// Webhook for Telegraf - MUST be registered like this in Express:
const WEBHOOK_PATH = '/webhook';
app.use(bot.webhookCallback(WEBHOOK_PATH, {
  secretToken: process.env.WEBHOOK_SECRET,
}));

app.use(express.json());
app.set('bot', bot);

app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);

const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
app.use('/app', express.static(FRONTEND_DIST));
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, async () => {
      console.log('[Server] Serwer uruchomiony na porcie ' + PORT);
      if (process.env.WEBHOOK_URL) {
        const webhookUrl = process.env.WEBHOOK_URL + WEBHOOK_PATH;
        await bot.telegram.setWebhook(webhookUrl, { secret_token: process.env.WEBHOOK_SECRET });
        console.log('[Bot] Webhook ustawiony: ' + webhookUrl);
      } else {
        console.warn('[Bot] WEBHOOK_URL nie ustawiony - uruchamiam long polling');
        bot.launch();
      }
    });
  } catch (err) {
    console.error('[Server] Blad startu:', err.message);
    process.exit(1);
  }
}

start();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
