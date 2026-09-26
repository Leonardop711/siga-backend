const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const db = require('./config/db');

const app = express();

// Middlewares globales de seguridad
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', apiLimiter);

// Rutas (Arquitectura Hexagonal)
app.use('/api', authRoutes);
app.use('/api/alumnos', alumnoRoutes);

// Endpoint de salud
app.get('/api/health', async (req, res) => {
    try {
        const client = await db.getClient();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'ok', db_time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al conectar con la BD.' });
    }
});

module.exports = app;
