const mongoose = require('mongoose');
const Ordine = require('../models/Ordine');
const Ticket = require('../models/Ticket');
const Evento = require('../models/Evento');
const { inviaEmailConferma } = require('../utils/email');

const acquistaBiglietti = async (req, res) => {
    const { quantita } = req.body;
    const utenteId = req.user._id;

    // L'operatore controlla i biglietti all'ingresso, non può comprarli
    if (req.user.ruolo === 'operatore') {
        return res.status(403).json({ errore: 'Gli operatori non possono acquistare biglietti.' });
    }

    if (!quantita || quantita < 1) {
        return res.status(400).json({ errore: 'Quantità non valida.' });
    }

    // Inizia la transazione (che evita che due biglietti vengano acquistati nello stesso identico istante di tempo)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Cerca l'evento (unico) includendolo nella sessione della transazione
        const evento = await Evento.findOne().session(session);
        if (!evento) {
            throw new Error('Evento non trovato.');
        }

        // 2. Controlla la disponibilità
        if (evento.ticketDisponibili < quantita) {
            throw new Error('Posti insufficienti per la quantità richiesta.');
        }

        // 3. Decrementa i ticket e calcola il totale
        evento.ticketDisponibili -= quantita;
        await evento.save({ session }); // Salva associando alla transazione

        const importoTotale = evento.prezzo * quantita;

        // 4. Crea l'Ordine
        // mongoose.create dentro una transazione restituisce sempre un array
        const [nuovoOrdine] = await Ordine.create([{
            utenteId,
            quantita,
            importoTotale
        }], { session }); 
        //il metodo .create usato con session, richiede un array [{...}] e ci risponde con un array
        //[nuovoOrdine] sta mettendo dentro la variabile nuovoOrdine solo il primo (che poi è anche l'unico) elemento dell'array che ci viene passato dalla funzione

        // 5. Crea i Ticket (uno per ogni biglietto acquistato)
        const ticketsDaCreare = Array.from({ length: quantita }).map(() => ({ //non è altro che un ciclo for che crea n spazi quanto è la qta e poi in ognuno di questi spazi inserisce un oggetto formato da ordineId
            ordineId: nuovoOrdine._id
        }));
        const ticketsGenerati = await Ticket.insertMany(ticketsDaCreare, { session });

        // 6. Conferma la transazione: ora è tutto salvato in modo definitivo
        await session.commitTransaction();
        session.endSession();

        // 7. Invia l'email in background (non blocca la risposta al client)
        inviaEmailConferma(req.user.email, evento, nuovoOrdine, ticketsGenerati);

        res.status(201).json({
            messaggio: 'Acquisto completato con successo!',
            ordine: nuovoOrdine,
            tickets: ticketsGenerati
        });

    } catch (error) {
        // Se si verifica un qualsiasi errore (posti finiti, db irraggiungibile), annulla TUTTO
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ errore: error.message });
    }
};

// Storico acquisti dell'utente loggato, con i codici da cui il frontend disegna i QR
const getMieiAcquisti = async (req, res) => {
    try {
        // utenteId arriva dal token (req.user), così un utente vede solo i propri ordini
        const ordini = await Ordine.find({ utenteId: req.user._id }).sort({ dataAcquisto: -1 });

        const acquisti = [];
        for (const ordine of ordini) {
            // Del ticket serve solo il codice: l'immagine QR non è salvata nel database
            const tickets = await Ticket.find({ ordineId: ordine._id }).select('codice');
            acquisti.push({
                id: ordine._id,
                quantita: ordine.quantita,
                importoTotale: ordine.importoTotale,
                dataAcquisto: ordine.dataAcquisto,
                tickets
            });
        }

        res.status(200).json(acquisti);
    } catch (error) {
        res.status(500).json({ errore: 'Errore nel recupero degli acquisti.' });
    }
};

module.exports = { acquistaBiglietti, getMieiAcquisti };