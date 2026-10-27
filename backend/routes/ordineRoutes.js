const express = require('express');
const router = express.Router();
const { acquistaBiglietti, getMieiAcquisti } = require('../controllers/ordineController');
const { autenticaJWT } = require('../middlewares/authMiddleware');

// POST /api/ordini/acquista
// Qualsiasi utente loggato può effettuare un acquisto
router.post('/acquista', autenticaJWT, acquistaBiglietti);

// GET /api/ordini/miei
// Storico acquisti e codici ticket dell'utente loggato
router.get('/miei', autenticaJWT, getMieiAcquisti);

module.exports = router;