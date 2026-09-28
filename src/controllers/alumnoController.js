const alumnoService = require('../services/alumnoService');

class AlumnoController {
    async getAlumnos(req, res) {
        try {
            const data = await alumnoService.getAlumnos(req.user, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Get alumnos error:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }

    async create(req, res) {
        try {
            const data = await alumnoService.createAlumno(req.body, req.user, req.ip);
            res.status(201).json({ status: 'ok', message: 'Alumno registrado exitosamente', data });
        } catch (err) {
            console.error('Create alumno error:', err);
            res.status(400).json({ status: 'error', message: err.message || 'Error al registrar alumno' });
        }
    }

    async update(req, res) {
        try {
            const data = await alumnoService.updateAlumno(req.params.matricula, req.body, req.user, req.ip);
            res.json({ status: 'ok', message: 'Alumno actualizado', data });
        } catch (err) {
            console.error('Update alumno error:', err);
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await alumnoService.deleteAlumno(req.params.matricula, req.user, req.ip);
            res.json({ status: 'ok', message: 'Alumno eliminado' });
        } catch (err) {
            console.error('Delete alumno error:', err);
            res.status(400).json({ status: 'error', message: err.message });
        }
    }
}

module.exports = new AlumnoController();
