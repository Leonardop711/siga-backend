const db = require('../config/db');

class UsuarioRepository {
    async getAll() {
        const result = await db.query('SELECT * FROM seguridad.usuarios');
        return result.rows;
    }
}
module.exports = new UsuarioRepository();