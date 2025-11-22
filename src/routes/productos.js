const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authMiddleware } = require('../middlewares/auth');

// Todas las rutas de productos requieren autenticación
router.use(authMiddleware);

router.get('/', productoController.getAllProductos);
router.get('/:id', productoController.getProductoById);
router.get('/:id/stock', productoController.getStockProducto);
router.post('/', productoController.createProducto);
router.put('/:id', productoController.updateProducto);

module.exports = router;
