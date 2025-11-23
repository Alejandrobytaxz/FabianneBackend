const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { authMiddleware, isAdmin } = require('../middlewares/auth');

// Rutas de solo lectura - accesible para todos los autenticados
router.get('/', authMiddleware, categoriaController.getAllCategorias);
router.get('/:id', authMiddleware, categoriaController.getCategoriaById);

// Rutas de escritura - solo para Administrador
router.post('/', authMiddleware, isAdmin, categoriaController.createCategoria);
router.put('/:id', authMiddleware, isAdmin, categoriaController.updateCategoria);
router.delete('/:id', authMiddleware, isAdmin, categoriaController.deleteCategoria);

module.exports = router;
