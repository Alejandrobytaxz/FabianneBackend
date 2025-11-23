const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authMiddleware, isAdmin } = require('../middlewares/auth');

// Rutas de solo lectura - accesible para todos los autenticados
router.get('/', authMiddleware, productoController.getAllProductos);
router.get('/:id', authMiddleware, productoController.getProductoById);
router.get('/:id/stock', authMiddleware, productoController.getStockProducto);

// Rutas de escritura - solo para Administrador
router.post('/', authMiddleware, isAdmin, productoController.createProducto);
router.put('/:id', authMiddleware, isAdmin, productoController.updateProducto);

module.exports = router;
