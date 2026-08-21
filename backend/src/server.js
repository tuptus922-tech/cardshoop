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

app.use(cors({ origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }));

// Telegraf webhook
const WEBHOOK_PATH = '/webhook';
app.use(bot.webhookCallback(WEBHOOK_PATH, { secretToken: process.env.WEBHOOK_SECRET }));

app.use(express.json());
app.set('bot', bot);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);

const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
app.use('/app', express.static(FRONTEND_DIST));
app.get('/app/*', (req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));

app.get('/health', (req, res) => res.json({ ok: true }));

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, async () => {
      console.log('[Server] Serwer uruchomiony');
      if (process.env.WEBHOOK_URL) {
        await bot.telegram.setWebhook(process.env.WEBHOOK_URL + WEBHOOK_PATH, { secret_token: process.env.WEBHOOK_SECRET });
        console.log('[Bot] Webhook zarejestrowany w Telegramie');
      }
    });
  } catch (err) {
    console.error(err);
  }
}

start();
