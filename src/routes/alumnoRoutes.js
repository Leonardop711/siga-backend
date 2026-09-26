const express = require('express');
const alumnoController = require('../controllers/alumnoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, alumnoController.getAlumnos);

module.exports = router;
