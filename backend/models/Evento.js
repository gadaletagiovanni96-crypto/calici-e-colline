const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    titolo: { type: String, required: true },
    descrizione: { type: String, required: true },
    dataOra: { type: Date, required: true },
    luogo: { type: String, required: true },
    prezzo: { type: Number, required: true, min: 0 },
    ticketDisponibili: { type: Number, required: true, min: 0 },
    immaginePromozionale: { type: String }
});

module.exports = mongoose.model('Evento', eventoSchema);