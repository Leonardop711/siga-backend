const db = require('../config/db');

class AuthRepository {
    async findUserByUsername(username) {
        const result = await db.query(
            'SELECT * FROM seguridad.usuarios WHERE username = $1 AND activo = true', 
            [username]
        );
        return result.rows[0];
    }

    async logAttempt(username, isSuccess, ip) {
        await db.query(
            'INSERT INTO seguridad.intentos_fallidos (usuario, exitoso, ip) VALUES ($1, $2, $3)', 
            [username, isSuccess, ip]
        );
    }

    async logAudit(action, username, details, ip) {
        await db.query(
            'INSERT INTO auditoria.logs (accion, usuario, detalles, ip) VALUES ($1, $2, $3, $4)', 
            [action, username, details, ip]
        );
    }

    async updateSessionToken(userId, token) {
        await db.query(
            'UPDATE seguridad.usuarios SET session_token = $1 WHERE id = $2',
            [token, userId]
        );
    }

    async getSessionToken(userId) {
        const result = await db.query(
            'SELECT session_token FROM seguridad.usuarios WHERE id = $1',
            [userId]
        );
        return result.rows[0]?.session_token;
    }
}

module.exports = new AuthRepository();
