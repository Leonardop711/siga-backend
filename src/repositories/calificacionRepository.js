const db = require('../config/db');

class CalificacionRepository {
    async getAll() {
        const result = await db.query('SELECT * FROM academico.calificaciones');
        return result.rows;
    }
}
module.exports = new CalificacionRepository();