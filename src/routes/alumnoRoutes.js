const express = require('express');
const alumnoController = require('../controllers/alumnoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, alumnoController.getAlumnos);
router.post('/', authMiddleware, authorizeRoles('admin'), alumnoController.create);

module.exports = router;
