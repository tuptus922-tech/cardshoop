'use strict';
const express = require('express');
const router = express.Router();

let cachedAdmins = null;
let cacheTime = 0;

router.get('/', async (req, res) => {
  const bot = req.app.get('bot');
  const now = Date.now();

  // Cache for 2 minutes to keep it responsive and fast
  if (cachedAdmins && now - cacheTime < 120000) {
    return res.json({ ok: true, admins: cachedAdmins });
  }

  const raw = process.env.ADMIN_IDS || process.env.ADMIN_GROUP_ID || '8534522754,5275642978';
  const adminIds = raw.split(',').map((id) => id.trim()).filter(Boolean);

  const admins = [];

  for (const id of adminIds) {
    try {
      const chat = await bot.telegram.getChat(id);
      let photoUrl = null;

      if (chat.photo && chat.photo.small_file_id) {
        try {
          const link = await bot.telegram.getFileLink(chat.photo.small_file_id);
          photoUrl = link.href;
        } catch (e) {}
      }

      const cleanUsername = chat.username ? chat.username.replace(/^@+/, '') : null;

      admins.push({
        id: String(chat.id),
        name: chat.first_name || (cleanUsername ? `@${cleanUsername}` : `Admin #${chat.id}`),
        username: cleanUsername,
        photoUrl: photoUrl,
        telegramUrl: cleanUsername ? `https://t.me/${cleanUsername}` : `https://t.me/cardshoop_bot`,
      });
    } catch (err) {
      console.warn(`[Support] Nie udalo sie pobrac danych dla admina ${id}:`, err.message);
      admins.push({
        id: String(id),
        name: `Admin`,
        username: null,
        photoUrl: null,
        telegramUrl: `https://t.me/cardshoop_bot`,
      });
    }
  }

  cachedAdmins = admins;
  cacheTime = now;

  res.json({ ok: true, admins });
});

module.exports = router;
