const express = require('express');
const calificacionController = require('../controllers/calificacionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authMiddleware, calificacionController.getAll.bind(calificacionController));
module.exports = router;