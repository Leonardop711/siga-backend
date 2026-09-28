const express = require('express');
const logController = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), logController.getAll.bind(logController));
module.exports = router;