const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

module.exports = (req, res, next) => {
    let token = null;

    // 1. Priorizar lectura de Cookie HttpOnly (Mitigación F-09)
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, item) => {
            const [key, ...val] = item.trim().split('=');
            if (key) acc[key] = val.join('=');
            return acc;
        }, {});
        if (cookies.token) {
            token = decodeURIComponent(cookies.token);
        }
    }

    // 2. Respaldo para clientes API / herramientas de auditoría con cabecera Authorization: Bearer
    if (!token && req.headers['authorization']) {
        token = req.headers['authorization'].split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Acceso denegado' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ status: 'error', message: 'Token invalido o expirado' });
        
        try {
            const currentSession = await authRepository.getSessionToken(decoded.id);
            if (!currentSession || currentSession !== decoded.sessionToken) {
                return res.status(401).json({ status: 'error', message: 'Sesion iniciada en otro dispositivo. Por favor inicie sesion nuevamente.' });
            }
            req.user = decoded;
            next();
        } catch (dbErr) {
            console.error('Error verificando sesion:', dbErr);
            return res.status(500).json({ status: 'error', message: 'Error interno de autenticacion' });
        }
    });
};
