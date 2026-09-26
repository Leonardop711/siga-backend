const db = require('../config/db');

class LogRepository {
    async getAll() {
        const result = await db.query('SELECT * FROM auditoria.logs');
        return result.rows;
    }
}
module.exports = new LogRepository();