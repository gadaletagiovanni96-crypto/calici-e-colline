const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
    ordineId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ordine', 
        required: true 
    },
    codice: { 
        type: String, 
        required: true, 
        unique: true,
        default: uuidv4 // Genera automaticamente una stringa univoca sicura
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);