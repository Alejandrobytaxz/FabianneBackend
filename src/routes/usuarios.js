const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, isAdmin } = require('../middlewares/auth');

// Todas las rutas de usuarios requieren autenticación y rol de Administrador
router.get('/', authMiddleware, isAdmin, usuarioController.getAllUsuarios);
router.get('/:id', authMiddleware, isAdmin, usuarioController.getUsuarioById);
router.post('/', authMiddleware, isAdmin, usuarioController.createUsuario);
router.put('/:id', authMiddleware, isAdmin, usuarioController.updateUsuario);
router.delete('/:id', authMiddleware, isAdmin, usuarioController.deleteUsuario);

module.exports = router;
