'use strict';
const express = require('express');
const { helpers } = require('../db/database');
const router = express.Router();

// Zwraca TYLKO produkty, ktore maja dostepne konta (> 0 sztuk w magazynie)
router.get('/', async (req, res) => {
  try {
    const products = await helpers.getInStockProducts();
    res.json({ ok: true, result: products });
  } catch (err) {
    console.error('[API/products] GET error:', err.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
