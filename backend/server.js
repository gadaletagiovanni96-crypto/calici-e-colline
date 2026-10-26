require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const ordineRoutes = require('./routes/ordineRoutes');
const operatoreRoutes = require('./routes/operatoreRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inizializzaSwagger = require('./utils/swagger');

const app = express();

// Middleware globali
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/ordini', ordineRoutes);
app.use('/api/operatore', operatoreRoutes);
app.use('/api/admin', adminRoutes);

inizializzaSwagger(app);

// Rotta di test
app.get('/api/status', (req, res) => {
    res.json({ message: 'API Calici e Colline operative.' });
});

// Connessione a MongoDB e avvio server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Database connesso con successo');
        app.listen(PORT, () => {
            console.log(`Server in esecuzione sulla porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Errore di connessione al database:', error.message);
    });