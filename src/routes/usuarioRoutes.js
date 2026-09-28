const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), usuarioController.getAll.bind(usuarioController));
router.post('/', authMiddleware, authorizeRoles('admin'), usuarioController.create.bind(usuarioController));
module.exports = router;