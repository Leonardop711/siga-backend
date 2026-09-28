const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authMiddleware, usuarioController.getAll.bind(usuarioController));
router.post('/', authMiddleware, usuarioController.create.bind(usuarioController));
module.exports = router;