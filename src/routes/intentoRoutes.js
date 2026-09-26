const express = require('express');
const intentoController = require('../controllers/intentoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authMiddleware, intentoController.getAll.bind(intentoController));
module.exports = router;