const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });

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
