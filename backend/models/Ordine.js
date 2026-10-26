const mongoose = require('mongoose');

const ordineSchema = new mongoose.Schema({
    utenteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Utente', 
        required: true 
    },
    quantita: { type: Number, required: true, min: 1 },
    importoTotale: { type: Number, required: true, min: 0 }
}, { 
    timestamps: { createdAt: 'dataAcquisto', updatedAt: false } 
});

module.exports = mongoose.model('Ordine', ordineSchema);