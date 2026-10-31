const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Captura errores inesperados en conexiones inactivas del pool para evitar caídas del proceso Node.js
pool.on('error', (err) => {
    console.error('Error imprevisto en cliente inactivo de PostgreSQL:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
};
