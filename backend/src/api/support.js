'use strict';
const express = require('express');
const router = express.Router();

let cachedAdmins = null;
let cacheTime = 0;

async function fetchAdminData(bot, id) {
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

    return {
      id: String(chat.id),
      name: chat.first_name || (cleanUsername ? `@${cleanUsername}` : `Admin #${chat.id}`),
      username: cleanUsername,
      photoUrl: photoUrl,
      telegramUrl: cleanUsername ? `https://t.me/${cleanUsername}` : `https://t.me/cardshoop_bot`,
    };
  } catch (err) {
    return {
      id: String(id),
      name: `Admin`,
      username: null,
      photoUrl: null,
      telegramUrl: `https://t.me/cardshoop_bot`,
    };
  }
}

router.get('/', async (req, res) => {
  const bot = req.app.get('bot');
  const now = Date.now();

  // Cache for 10 minutes to make API calls return in <10ms
  if (cachedAdmins && now - cacheTime < 600000) {
    return res.json({ ok: true, admins: cachedAdmins });
  }

  const raw = process.env.ADMIN_IDS || process.env.ADMIN_GROUP_ID || '8534522754,5275642978';
  const adminIds = raw.split(',').map((id) => id.trim()).filter(Boolean);

  try {
    // Parallel async resolution instead of serial loops
    const admins = await Promise.all(adminIds.map((id) => fetchAdminData(bot, id)));
    cachedAdmins = admins;
    cacheTime = now;
    res.json({ ok: true, admins });
  } catch (err) {
    res.json({ ok: true, admins: cachedAdmins || [] });
  }
});

module.exports = router;
