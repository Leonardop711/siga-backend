const db = require('../config/db');

class IntentoRepository {
    async getAll() {
        const result = await db.query('SELECT * FROM seguridad.intentos_fallidos');
        return result.rows;
    }
}
module.exports = new IntentoRepository();