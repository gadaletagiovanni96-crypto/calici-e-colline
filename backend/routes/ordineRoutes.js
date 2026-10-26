const express = require('express');
const router = express.Router();
const { acquistaBiglietti } = require('../controllers/ordineController');
const { autenticaJWT } = require('../middlewares/authMiddleware');

// POST /api/ordini/acquista
// Qualsiasi utente loggato può effettuare un acquisto
router.post('/acquista', autenticaJWT, acquistaBiglietti);

module.exports = router;