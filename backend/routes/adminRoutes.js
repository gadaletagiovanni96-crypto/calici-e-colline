const express = require('express');
const router = express.Router();
const { getDashboardData, creaOperatore } = require('../controllers/adminController');
const { autenticaJWT, autorizzaRuoli } = require('../middlewares/authMiddleware');

// Rotta per vedere le statistiche (Solo Amministratore)
router.get('/dashboard', autenticaJWT, autorizzaRuoli('amministratore'), getDashboardData);

// Rotta per creare nuovi operatori (Solo Amministratore)
router.post('/operatori', autenticaJWT, autorizzaRuoli('amministratore'), creaOperatore);

module.exports = router;