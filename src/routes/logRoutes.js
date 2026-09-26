const express = require('express');
const logController = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authMiddleware, logController.getAll.bind(logController));
module.exports = router;