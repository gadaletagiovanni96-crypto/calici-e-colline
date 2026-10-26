const express = require('express');
const router = express.Router();
const { registraUtente, loginUtente } = require('../controllers/authController');

// Endpoint: POST /api/auth/
router.post('/registrazione', registraUtente);
router.post('/login', loginUtente);

module.exports = router;