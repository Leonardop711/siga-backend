const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const result = await authService.login(username, password, req.ip);

            // Mitigación F-09: Emitir el JWT dentro de una cookie protegida con HttpOnly, Secure y SameSite=Strict
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000, // 1 hora
                path: '/'
            });

            res.json({
                status: 'ok',
                rol: result.rol,
                username: result.username,
                expiresIn: 3600
            });
        } catch (err) {
            if (err.message === 'Credenciales incorrectas') {
                return res.status(401).json({ status: 'error', message: err.message });
            }
            console.error('Login error:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }

    async logout(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            path: '/'
        });
        res.json({ status: 'ok', message: 'Sesión cerrada exitosamente' });
    }
}

module.exports = new AuthController();
