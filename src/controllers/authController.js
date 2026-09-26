const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const result = await authService.login(username, password, req.ip);
            res.json({ status: 'ok', ...result });
        } catch (err) {
            if (err.message === 'Credenciales incorrectas') {
                return res.status(401).json({ status: 'error', message: err.message });
            }
            console.error('Login error:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}

module.exports = new AuthController();
