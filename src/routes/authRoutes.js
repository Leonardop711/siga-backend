const express = require('express');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutos
    max: 5,
    message: { status: 'error', message: 'Múltiples intentos fallidos. Por seguridad, espere 3 minutos.' }
});

router.post('/login', authLimiter, authController.login);

module.exports = router;
