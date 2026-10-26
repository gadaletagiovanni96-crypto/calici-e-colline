const Utente = require('../models/Utente');
const jwt = require('jsonwebtoken');

// Registrazione
const registraUtente = async (req, res) => {
    try {
        const { nome, cognome, email, password } = req.body;

        // Verifica se l'email esiste già
        const utenteEsistente = await Utente.findOne({ email });
        if (utenteEsistente) {
            return res.status(400).json({ errore: 'Email già registrata.' });
        }

        // Crea il nuovo utente (l'hashing della password avviene in automatico col pre-save)
        const nuovoUtente = new Utente({
            nome,
            cognome,
            email,
            passwordHash: password // Passiamo la password in chiaro
        });

        await nuovoUtente.save();

        res.status(201).json({ messaggio: 'Registrazione completata con successo.' });
    } catch (error) {
        res.status(500).json({ errore: 'Errore durante la registrazione.', dettaglio: error.message });
    }
};

// Login
const loginUtente = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cerca l'utente nel database
        const utente = await Utente.findOne({ email });
        if (!utente) {
            return res.status(401).json({ errore: 'Credenziali non valide.' });
        }

        // Usa utenteSchema.methods
        const passwordValida = await utente.confrontaPassword(password);
        if (!passwordValida) {
            return res.status(401).json({ errore: 'Credenziali non valide.' });
        }

        // Genera il token JWT con i dati essenziali (Payload)
        const token = jwt.sign(
            { id: utente._id, ruolo: utente.ruolo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Risponde con il token e i dati puliti
        res.status(200).json({
            messaggio: 'Login effettuato.',
            token,
            utente: {
                id: utente._id,
                nome: utente.nome,
                cognome: utente.cognome,
                email: utente.email,
                ruolo: utente.ruolo
            }
        });
    } catch (error) {
        res.status(500).json({ errore: 'Errore durante il login.', dettaglio: error.message });
    }
};

module.exports = { registraUtente, loginUtente };