const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

// Rutas públicas (sin autenticación)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
