'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');

const bot = require('./bot/index');
const { runMigrations } = require('./db/migrations');
const productsRouter = require('./api/products');
const invoicesRouter = require('./api/invoices');
const supportRouter = require('./api/support');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cardshoop.vercel.app';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

// Webhook for Telegraf (Fast response)
const WEBHOOK_PATH = '/webhook';
app.use(bot.webhookCallback(WEBHOOK_PATH, {
  secretToken: process.env.WEBHOOK_SECRET,
}));

app.use(express.json());
app.set('bot', bot);

app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/support', supportRouter);

const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
app.use('/app', express.static(FRONTEND_DIST, { maxAge: '1d' }));
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() }));

// Keep-alive pinger to prevent Render instance from cold sleeping during daytime
function startKeepAlive(url) {
  if (!url) return;
  setInterval(() => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url + '/health', (res) => {
        // Ping success
      }).on('error', () => {});
    } catch (e) {}
  }, 10 * 60 * 1000); // every 10 min
}

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, async () => {
      console.log('[Server] Serwer uruchomiony na porcie ' + PORT);

      // Automatyczne ustawienie stalego przycisku [Open] obok pola wpisywania
      try {
        await bot.telegram.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: 'Open',
            web_app: { url: FRONTEND_URL },
          },
        });
        console.log('[Bot] Przycisk Menu [Open] ustawiony pomyslnie dla ' + FRONTEND_URL);
      } catch (err) {
        console.error('[Bot] Blad setChatMenuButton:', err.message);
      }

      if (process.env.WEBHOOK_URL) {
        const webhookUrl = process.env.WEBHOOK_URL + WEBHOOK_PATH;
        await bot.telegram.setWebhook(webhookUrl, { secret_token: process.env.WEBHOOK_SECRET });
        console.log('[Bot] Webhook ustawiony: ' + webhookUrl);
        startKeepAlive(process.env.WEBHOOK_URL);
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
