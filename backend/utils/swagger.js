const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const opzioni = {
    definition: {
        // 1. Dichiariamo esplicitamente la versione 3.0.0 (FONDAMENTALE per vedere i riquadri neri)
        openapi: '3.0.0',
        info: {
            title: 'API Calici e Colline',
            version: '1.0.0',
            description: 'Documentazione delle API REST per la piattaforma enoturistica',
        },
        // 2. Configuriamo il bottone "Authorize" per incollare il token JWT
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    // 3. Diciamo a Swagger di cercare i commenti dentro la cartella docs
    apis: ['./docs/*.js', './docs/*.yaml'], 
};

const specifiche = swaggerJsdoc(opzioni);

const inizializzaSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specifiche));
    console.log('Swagger disponibile su http://localhost:5000/api-docs');
};

module.exports = inizializzaSwagger;