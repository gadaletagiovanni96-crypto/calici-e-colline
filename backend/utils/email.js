const nodemailer = require('nodemailer');

const inviaEmailConferma = async (emailUtente, evento, ordine, tickets) => {
    try {
        // Usa i dati configurati nel file .env
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false, // true per la porta 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const codiciTicket = tickets.map(t => t.codice).join('\n');

        const messaggio = {
            from: `"Calici e Colline" <${process.env.SMTP_USER}>`,
            to: emailUtente,
            subject: 'Conferma Acquisto Biglietti - Calici e Colline',
            text: `Grazie per il tuo acquisto!\n\nHai acquistato ${ordine.quantita} biglietti per ${evento.titolo}.\nImporto totale: €${ordine.importoTotale}\n\nI tuoi codici univoci per i QR Code sono:\n${codiciTicket}\n\nPuoi visualizzare i QR Code nella tua area personale.`
        };

        await transporter.sendMail(messaggio);
        console.log(`Email di conferma inviata a ${emailUtente}`);
    } catch (error) {
        console.error('Errore invio email (verifica le credenziali SMTP):', error.message);
        // Non blocchiamo l'applicazione se la mail fallisce
    }
};

module.exports = { inviaEmailConferma };