const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');
const { authMiddleware } = require('../middlewares/auth');

// Todas las rutas de entradas requieren autenticación
router.use(authMiddleware);

router.get('/', entradaController.getAllEntradas);
router.get('/:id', entradaController.getEntradaById);
router.post('/', entradaController.createEntrada);

module.exports = router;
