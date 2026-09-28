const db = require('../config/db');

class UsuarioRepository {
    async getAll() {
        const result = await db.query('SELECT id, username, rol, activo, creado_en FROM seguridad.usuarios ORDER BY id ASC');
        return result.rows;
    }

    async findByUsername(username) {
        const result = await db.query('SELECT * FROM seguridad.usuarios WHERE username = $1', [username]);
        return result.rows[0];
    }

    async create({ username, password_hash, rol, activo = true }) {
        const result = await db.query(`
            INSERT INTO seguridad.usuarios (username, password_hash, rol, activo)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, rol, activo, creado_en
        `, [username, password_hash, rol, activo]);
        return result.rows[0];
    }
}
module.exports = new UsuarioRepository();