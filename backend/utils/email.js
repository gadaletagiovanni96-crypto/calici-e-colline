const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const inviaEmailConferma = async (emailUtente, evento, ordine, tickets) => {
    try {
        // Il server SMTP è quello del provider di posta (Gmail, Outlook, Aruba, ...)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST?.trim(),
            port: 587,
            secure: false, // 587 parte in chiaro e poi attiva TLS
            auth: {
                user: process.env.SMTP_USER?.trim(),
                pass: process.env.SMTP_PASS?.trim()
            }
        });

        // Un'immagine PNG per biglietto, allegata dentro la mail (non un link esterno)
        const allegati = [];
        const immagini = [];
        for (let i = 0; i < tickets.length; i++) {
            const codice = tickets[i].codice;
            const png = await QRCode.toBuffer(codice, { type: 'png', width: 220, margin: 1 });
            const cid = `qr${i}`;
            allegati.push({
                filename: `biglietto-${i + 1}.png`,
                content: png,
                cid
            });
            immagini.push(`
                <p><strong>Biglietto ${i + 1}</strong></p>
                <img src="cid:${cid}" alt="QR code del biglietto ${i + 1}" />
                <p>${codice}</p>
            `);
        }

        const testoCodici = tickets.map((ticket) => ticket.codice).join('\n');

        const messaggio = {
            from: `"Calici e Colline" <${process.env.SMTP_USER?.trim()}>`,
            to: emailUtente,
            subject: 'Conferma Acquisto Biglietti - Calici e Colline',
            text: `Grazie per il tuo acquisto!\n\nHai acquistato ${ordine.quantita} biglietti per ${evento.titolo}.\nImporto totale: €${ordine.importoTotale}\n\nI QR Code sono allegati a questa email. I codici sono:\n${testoCodici}\n\nPuoi rivederli anche nella tua area personale.`,
            html: `
                <p>Grazie per il tuo acquisto!</p>
                <p>Hai acquistato ${ordine.quantita} biglietti per <strong>${evento.titolo}</strong>.</p>
                <p>Importo totale: €${ordine.importoTotale}</p>
                ${immagini.join('')}
                <p>Puoi rivedere i QR Code anche nella tua area personale.</p>
            `,
            attachments: allegati
        };

        await transporter.sendMail(messaggio);
        console.log(`Email di conferma inviata a ${emailUtente}`);
    } catch (error) {
        console.error('Errore invio email (verifica le credenziali SMTP):', error.message);
        // Non blocchiamo l'applicazione se la mail fallisce
    }
};

module.exports = { inviaEmailConferma };
