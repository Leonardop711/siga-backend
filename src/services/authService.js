const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('../repositories/authRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

class AuthService {
    async login(username, password, ip) {
        const user = await authRepository.findUserByUsername(username);
        
        if (!user) {
            await authRepository.logAttempt(username, false, ip);
            throw new Error('Credenciales incorrectas');
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            await authRepository.logAttempt(username, false, ip);
            throw new Error('Credenciales incorrectas');
        }

        await authRepository.logAttempt(username, true, ip);
        await authRepository.logAudit('LOGIN_SUCCESS', username, 'Sesion iniciada', ip);

        const sessionToken = crypto.randomBytes(16).toString('hex');
        await authRepository.updateSessionToken(user.id, sessionToken);

        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol, sessionToken }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return { token, rol: user.rol, username: user.username };
    }
}
module.exports = new AuthService();
