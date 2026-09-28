const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(403).json({ status: 'error', message: 'Acceso denegado. No se encontró el rol del usuario.' });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ 
                status: 'error', 
                message: `Acceso denegado. Se requiere nivel de privilegio: ${allowedRoles.join(' o ')}.` 
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
