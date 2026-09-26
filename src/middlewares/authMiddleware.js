const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Acceso denegado' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
        req.user = decoded;
        next();
    });
};
