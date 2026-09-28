const express = require('express');
const calificacionController = require('../controllers/calificacionController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', authMiddleware, calificacionController.getAll.bind(calificacionController));
router.post('/', authMiddleware, authorizeRoles('admin', 'docente'), calificacionController.create.bind(calificacionController));
module.exports = router;