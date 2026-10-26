const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //per crittografare la password nel DB

const utenteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true
    },
    passwordHash: { 
        type: String, 
        required: true // Ora è sempre obbligatoria
    },
    ruolo: { 
        type: String, 
        enum: ['amministratore', 'operatore', 'utente'], 
        default: 'utente' 
    }
}, { 
    timestamps: { createdAt: 'dataCreazione', updatedAt: false } 
});

// Middleware pre-save per generare l'hash della password
utenteSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next(); //procedi al salvataggio
    } catch (error) {
        next(error);
    }
});

// Metodo per la verifica della password in fase di login
utenteSchema.methods.confrontaPassword = async function(passwordInserita) {
    return await bcrypt.compare(passwordInserita, this.passwordHash); //compara la password in chiaro con quella crittografata e se coincidono restituisce true
};

module.exports = mongoose.model('Utente', utenteSchema);