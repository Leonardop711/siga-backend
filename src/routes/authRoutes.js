const express = require('express');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos de bloqueo
    max: 10, // 10 intentos fallidos permitidos
    skipSuccessfulRequests: true,
    message: { status: 'error', message: 'Múltiples intentos fallidos. Por seguridad, espere 5 minutos.' }
});

// Reiniciar el contador de intentos fallidos a 0 cuando el usuario logra iniciar sesión exitosamente
const resetLimiterOnSuccess = (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode === 200 && typeof authLimiter.resetKey === 'function') {
            authLimiter.resetKey(req.ip);
        }
    });
    next();
};

router.post('/login', authLimiter, resetLimiterOnSuccess, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
