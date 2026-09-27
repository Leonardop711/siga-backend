const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

/**
 * Servicio de Autenticación y Manejo de Sesiones.
 * Implementa verificación de contraseñas mediante BCrypt, emisión de tokens JWT,
 * registro de intentos fallidos y bitácora de auditoría.
 */
class AuthService {
    /**
     * Autentica un usuario verificando sus credenciales contra la base de datos.
     * Registra intentos exitosos o fallidos para auditoría y prevención de ataques de fuerza bruta.
     *
     * @param {string} username - Nombre de usuario.
     * @param {string} password - Contraseña en texto plano enviada por el cliente.
     * @param {string} ip - Dirección IP desde la cual se origina el intento de inicio de sesión.
     * @throws {Error} Lanza error con mensaje 'Credenciales incorrectas' si el usuario no existe o la contraseña no coincide.
     * @returns {Promise<{token: string, rol: string, username: string}>} Objeto con el token JWT firmado, rol y nombre de usuario.
     */
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
        await authRepository.logAudit('LOGIN_SUCCESS', username, 'Sesión iniciada', ip);

        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return { token, rol: user.rol, username: user.username };
    }
}

module.exports = new AuthService();
