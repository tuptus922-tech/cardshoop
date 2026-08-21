'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const bot = require('./bot/index');
const { fulfillOrder } = require('./bot/payments');
const { helpers } = require('./db/database');
const { runMigrations } = require('./db/migrations');
const productsRouter = require('./api/products');
const invoicesRouter = require('./api/invoices');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));

app.use((req, res, next) => {
  if (req.path === '/crypto-webhook') {
    express.raw({ type: '*/*' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.set('bot', bot);

const WEBHOOK_PATH = '/webhook';
app.use(WEBHOOK_PATH, bot.webhookCallback(WEBHOOK_PATH, {
  secretToken: process.env.WEBHOOK_SECRET,
}));

app.post('/crypto-webhook', async (req, res) => {
  const signature = req.headers['crypto-pay-api-signature'];
  const body = req.body;
  if (signature && process.env.CRYPTOBOT_WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', process.env.CRYPTOBOT_WEBHOOK_SECRET).update(body).digest('hex');
    if (hmac !== signature) {
      console.warn('[CryptoWebhook] Nieprawidlowa sygnatura!');
      return res.status(401).send('Invalid signature');
    }
  }
  let update;
  try {
    update = JSON.parse(body.toString());
  } catch {
    return res.status(400).send('Invalid JSON');
  }
  if (update.update_type === 'invoice_paid') {
    const invoice = update.payload;
    console.log('[CryptoWebhook] Platnosc: invoice_id=' + invoice.invoice_id);
    try {
      const order = await helpers.getOrderByCryptoBotId(invoice.invoice_id);
      if (order && order.status === 'pending') {
        await helpers.updateOrderStatus(order.id, 'paid');
        await fulfillOrder(bot, order.id);
      }
    } catch (err) {
      console.error('[CryptoWebhook] Blad realizacji:', err.message);
    }
  }
  res.sendStatus(200);
});

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
