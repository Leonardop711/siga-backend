const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

// Middlewares de seguridad (Helmet para cabeceras OWASP)
app.use(helmet());
app.use(cors({
    origin: '*', // En AWS, cambia esto por el dominio real de S3 o CloudFront
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Limiter específico para Auth (Protección Fuerza Bruta A07)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Bloquear después de 5 intentos fallidos
    message: { status: 'error', message: 'Demasiados intentos de login, intente más tarde.' }
});

// Limiter general
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', apiLimiter);

// Middleware JWT para validar sesión
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
        req.user = decoded; // Injectamos el payload en el request
        next();
    });
};

// === ENDPOINTS ===

// 1. LOGIN (OWASP: Retorna error genérico, evita timing attacks, registra intentos)
app.post('/api/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;
    const client = await pool.connect();
    
    try {
        // Parametrización para evitar SQL Injection (A03)
        const result = await client.query('SELECT * FROM seguridad.usuarios WHERE username = $1 AND activo = true', [username]);
        
        // El usuario no existe
        if (result.rows.length === 0) {
            await client.query('INSERT INTO seguridad.intentos_fallidos (usuario, exitoso, ip) VALUES ($1, false, $2)', [username, req.ip]);
            // El mensaje de error NO debe revelar que el usuario no existe
            return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        // bcrypt maneja su propio salt, seguro y confiable
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            await client.query('INSERT INTO seguridad.intentos_fallidos (usuario, exitoso, ip) VALUES ($1, false, $2)', [username, req.ip]);
            return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
        }

        // Autenticación Exitosa
        await client.query('INSERT INTO seguridad.intentos_fallidos (usuario, exitoso, ip) VALUES ($1, true, $2)', [username, req.ip]);
        await client.query('INSERT INTO auditoria.logs (accion, usuario, detalles, ip) VALUES ($1, $2, $3, $4)', ['LOGIN_SUCCESS', username, 'Sesión iniciada', req.ip]);

        // Firma del JWT con expiración corta de 1 hora
        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.json({ status: 'ok', token, rol: user.rol, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// 2. LISTADO DE ALUMNOS (Endpoint Protegido - Requiere JWT)
app.get('/api/alumnos', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Audit log para registro de lectura de datos sensibles
        await client.query('INSERT INTO auditoria.logs (accion, usuario, detalles, ip) VALUES ($1, $2, $3, $4)', ['READ_ALUMNOS', req.user.username, 'Acceso a listado de alumnos', req.ip]);
        
        // Uso de parámetros implícito o vistas en lugar de concatenación
        const result = await client.query(`
            SELECT a.matricula, a.nombre, a.apellido, a.semestre, c.asignatura, c.calificacion 
            FROM academico.alumnos a 
            LEFT JOIN academico.calificaciones c ON a.matricula = c.matricula 
            WHERE a.activo = true
            ORDER BY a.apellido ASC
        `);
        res.json({ status: 'ok', data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener datos' });
    } finally {
        client.release();
    }
});

app.listen(port, () => console.log(`Backend protegido ejecutándose en el puerto ${port}`));
