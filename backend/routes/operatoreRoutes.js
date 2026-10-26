const express = require('express');
const router = express.Router();
const { verificaTicket } = require('../controllers/operatoreController');
const { autenticaJWT, autorizzaRuoli } = require('../middlewares/authMiddleware');

// POST /api/operatore/verifica
// Accesso consentito a Operatori e Amministratori
router.post('/verifica', autenticaJWT, autorizzaRuoli('operatore', 'amministratore'), verificaTicket);

module.exports = router;