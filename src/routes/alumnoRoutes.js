const express = require('express');
const alumnoController = require('../controllers/alumnoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, alumnoController.getAlumnos);
router.post('/', authMiddleware, alumnoController.create);

module.exports = router;
