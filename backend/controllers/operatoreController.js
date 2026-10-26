const Ticket = require('../models/Ticket');

const verificaTicket = async (req, res) => {
    try {
        const { codice } = req.body;

        if (!codice) {
            return res.status(400).json({ errore: 'Nessun codice fornito.' });
        }

        // Cerca il ticket e popola i dati dell'acquirente
        const ticket = await Ticket.findOne({ codice }).populate({
            path: 'ordineId',
            populate: { 
                path: 'utenteId', 
                select: 'nome cognome email'
            }
        });

        // 1. Il biglietto non esiste nel database
        if (!ticket) {
            return res.status(404).json({ 
                valido: false, 
                messaggio: 'Biglietto NON TROVATO. Potrebbe essere falso.' 
            });
        }

        // 2. Il biglietto esiste ma è già stato convalidato in precedenza
        if (ticket.utilizzato) {
            return res.status(409).json({ // 409 Conflict o 400 Bad Request
                valido: false, 
                messaggio: 'ATTENZIONE: Biglietto GIÀ SCANSIONATO!',
                dataScansione: ticket.dataUtilizzo 
            });
        }

        // 3. Il biglietto è valido e nuovo: lo CONVALIDIAMO
        ticket.utilizzato = true;
        ticket.dataUtilizzo = new Date(); // Registriamo l'ora esatta dell'ingresso
        await ticket.save();

        // Risposta di successo
        res.status(200).json({
            valido: true,
            messaggio: 'Biglietto Convalidato con successo! Ingresso consentito.',
            dettagli: {
                codice: ticket.codice,
                acquirente: `${ticket.ordineId.utenteId.nome} ${ticket.ordineId.utenteId.cognome}`,
                email: ticket.ordineId.utenteId.email,
                dataUtilizzo: ticket.dataUtilizzo
            }
        });

    } catch (error) {
        res.status(500).json({ errore: 'Errore durante la validazione.', dettaglio: error.message });
    }
};

module.exports = { verificaTicket };