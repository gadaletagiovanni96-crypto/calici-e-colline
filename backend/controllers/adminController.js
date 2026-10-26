const Evento = require('../models/Evento');
const Ticket = require('../models/Ticket');
const Ordine = require('../models/Ordine');
const Utente = require('../models/Utente');
const bcrypt = require('bcryptjs');

// 1. Dashboard: Recupera statistiche e lista acquirenti
const getDashboardData = async (req, res) => {
    try {
        const evento = await Evento.findOne();
        if (!evento) {
            return res.status(404).json({ errore: 'Evento non ancora configurato.' });
        }

        const bigliettiVenduti = await Ticket.countDocuments();

        const ordini = await Ordine.find()
            .populate('utenteId', 'nome cognome email')
            .sort({ dataAcquisto: -1 });

        const acquirenti = ordini.map(ordine => ({
            idOrdine: ordine._id,
            nome: ordine.utenteId.nome,
            cognome: ordine.utenteId.cognome,
            email: ordine.utenteId.email,
            quantita: ordine.quantita,
            dataAcquisto: ordine.dataAcquisto
        }));

        res.status(200).json({
            statistiche: {
                bigliettiVenduti,
                bigliettiDisponibili: evento.ticketDisponibili,
                ricavoTotale: ordini.reduce((acc, ordine) => acc + ordine.importoTotale, 0)
            },
            acquirenti
        });

    } catch (error) {
        res.status(500).json({ errore: 'Errore nel recupero della dashboard.', dettaglio: error.message });
    }
};

// 2. Crea un nuovo account Operatore
const creaOperatore = async (req, res) => {
    try {
        const { nome, cognome, email, password } = req.body;

        if (!nome || !cognome || !email || !password) {
            return res.status(400).json({ errore: 'Tutti i campi sono obbligatori.' });
        }

        const utenteEsistente = await Utente.findOne({ email });
        if (utenteEsistente) {
            return res.status(400).json({ errore: 'Email già in uso nel sistema.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuovoOperatore = await Utente.create({
            nome,
            cognome,
            email,
            passwordHash,
            ruolo: 'operatore'
        });

        res.status(201).json({
            messaggio: 'Operatore creato con successo.',
            operatore: {
                id: nuovoOperatore._id,
                nome: nuovoOperatore.nome,
                email: nuovoOperatore.email,
                ruolo: nuovoOperatore.ruolo
            }
        });
    } catch (error) {
        res.status(500).json({ errore: 'Errore nella creazione dell\'operatore.', dettaglio: error.message });
    }
};

module.exports = { getDashboardData, creaOperatore };