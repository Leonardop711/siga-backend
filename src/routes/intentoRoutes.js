const express = require('express');
const intentoController = require('../controllers/intentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), intentoController.getAll.bind(intentoController));
module.exports = router;