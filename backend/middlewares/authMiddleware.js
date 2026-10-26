const jwt = require('jsonwebtoken');
const Utente = require('../models/Utente');

// 1. Controllo del Token (Il Buttafuori base)
const autenticaJWT = async (req, res, next) => {
    try {
        // Cerca il token nell'intestazione della richiesta
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ errore: 'Accesso negato. Nessun token fornito.' });
        }

        // Estrae il token (rimuove la parola "Bearer ")
        const token = authHeader.split(' ')[1];

        // Decodifica il token usando la nostra chiave segreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Cerca l'utente nel DB per assicurarsi che esista ancora
        const utente = await Utente.findById(decoded.id).select('-passwordHash');
        if (!utente) {
            return res.status(401).json({ errore: 'Utente non trovato.' });
        }

        // Attacca l'utente alla richiesta per le rotte successive
        req.user = utente;
        next(); // Tutto ok, passa oltre!

    } catch (error) {
        return res.status(403).json({ errore: 'Token non valido o scaduto.' });
    }
};

// 2. Controllo del Ruolo
const autorizzaRuoli = (...ruoliAmmessi) => { //prende tutti i ruoli che gli passiamo e crea un array
    return (req, res, next) => {
        // Se il ruolo dell'utente non è nella lista consentita, bloccalo
        if (!ruoliAmmessi.includes(req.user.ruolo)) {
            return res.status(403).json({ 
                errore: 'Permessi insufficienti per eseguire questa operazione.' 
            });
        }
        next(); // Ruolo corretto, va avanti
    };
};

module.exports = { autenticaJWT, autorizzaRuoli };