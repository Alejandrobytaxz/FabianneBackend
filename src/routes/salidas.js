const express = require('express');
const router = express.Router();
const salidaController = require('../controllers/salidaController');
const { authMiddleware } = require('../middlewares/auth');

// Todas las rutas de salidas requieren autenticación
router.use(authMiddleware);

router.get('/', salidaController.getAllSalidas);
router.get('/:id', salidaController.getSalidaById);
router.post('/', salidaController.createSalida);

module.exports = router;
