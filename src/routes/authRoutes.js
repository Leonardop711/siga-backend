const express = require('express');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Demasiados intentos de login, intente más tarde.' }
});

router.post('/login', authLimiter, authController.login);

module.exports = router;
