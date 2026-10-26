const Evento = require('../models/Evento');

// Visualizza i dettagli dell'evento (Per tutti gli utenti loggati)
const getEvento = async (req, res) => {
    try {
        // Estrae l'unico evento dal DB
        const evento = await Evento.findOne();
        
        if (!evento) {
            return res.status(404).json({ errore: 'Evento non ancora configurato.' });
        }
        
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).json({ errore: 'Errore nel recupero dell\'evento.', dettaglio: error.message });
    }
};

// Crea o Aggiorna l'evento (Solo per Amministratori)
const aggiornaEvento = async (req, res) => {
    try {
        const { titolo, descrizione, dataOra, luogo, prezzo, ticketDisponibili, immaginePromozionale } = req.body;

        // Prendiamo l'unico evento (se esiste)
        let evento = await Evento.findOne();

        if (evento) {
            // Se l'evento esiste già, lo aggiorniamo con i nuovi dati
            evento.titolo = titolo || evento.titolo;
            evento.descrizione = descrizione || evento.descrizione;
            evento.dataOra = dataOra || evento.dataOra;
            evento.luogo = luogo || evento.luogo;
            evento.prezzo = prezzo !== undefined ? prezzo : evento.prezzo;
            evento.ticketDisponibili = ticketDisponibili !== undefined ? ticketDisponibili : evento.ticketDisponibili;
            evento.immaginePromozionale = immaginePromozionale || evento.immaginePromozionale;
            
            await evento.save();
            return res.status(200).json({ messaggio: 'Evento aggiornato con successo.', evento });
        } else {
            // Se il database è vuoto (prima volta), creiamo l'evento da zero
            evento = new Evento({
                titolo, descrizione, dataOra, luogo, prezzo, ticketDisponibili, immaginePromozionale
            });
            await evento.save();
            return res.status(201).json({ messaggio: 'Evento creato con successo.', evento });
        }
    } catch (error) {
        res.status(500).json({ errore: 'Errore nel salvataggio dell\'evento.', dettaglio: error.message });
    }
};

module.exports = { getEvento, aggiornaEvento };