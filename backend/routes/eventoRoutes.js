const express = require('express');
const router = express.Router();
const { getEvento, aggiornaEvento } = require('../controllers/eventoController');
const { autenticaJWT, autorizzaRuoli } = require('../middlewares/authMiddleware');

// GET /api/evento
// Accesso: Qualsiasi utente loggato (serve solo autenticaJWT)
router.get('/', getEvento);

// PUT /api/evento
// Accesso: SOLO Amministratori (serve autenticaJWT + autorizzaRuoli)
router.put('/', autenticaJWT, autorizzaRuoli('amministratore'), aggiornaEvento);

module.exports = router;