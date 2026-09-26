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
}

module.exports = new AuthRepository();
