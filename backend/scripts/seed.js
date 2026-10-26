require('dotenv').config();
const mongoose = require('mongoose');
const Utente = require('../models/Utente');
const Evento = require('../models/Evento');

const eseguiSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connesso a MongoDB per il Setup...');

        // Rimuove i vecchi account corrotti (se esistono) per rimpiazzarli
        await Utente.deleteMany({ email: { $in: ['admin@caliciecolline.it', 'scanner@caliciecolline.it'] } });
        console.log('Vecchi account di sistema rimossi.');

        // 2. Creazione dell'Amministratore
        await Utente.create({
            nome: 'Admin',
            cognome: 'Principale',
            email: 'admin@caliciecolline.it',
            passwordHash: 'AdminPassword123!', //
            ruolo: 'amministratore'
        });
        console.log('Account Amministratore creato (admin@caliciecolline.it / AdminPassword123!)');

        // 3. Creazione dell'Operatore Scanner
        await Utente.create({
            nome: 'Operatore',
            cognome: 'Ingresso',
            email: 'scanner@caliciecolline.it',
            passwordHash: 'Scanner123!', // <-- In chiaro
            ruolo: 'operatore'
        });
        console.log('Account Operatore creato (scanner@caliciecolline.it / Scanner123!)');

        // 4. Inizializzazione Evento vuoto (se non esiste)
        const eventoEsistente = await Evento.findOne();
        if (!eventoEsistente) {
            await Evento.create({
                titolo: 'Calici e Colline 2026',
                descrizione: 'Evento enogastronomico tra le colline.',
                dataOra: new Date('2026-09-15T18:00:00Z'),
                luogo: 'Piazza Centrale, Molfetta',
                prezzo: 15.00,
                ticketDisponibili: 500
            });
            console.log('Evento base inizializzato nel database.');
        } else {
            console.log('Evento già inizializzato.');
        }

        console.log('Setup completato con successo!');
        process.exit();
    } catch (error) {
        console.error('Errore durante il setup:', error);
        process.exit(1);
    }
};

eseguiSeed();