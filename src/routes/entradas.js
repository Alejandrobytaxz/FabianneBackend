const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');

router.get('/', entradaController.getAllEntradas);
router.get('/:id', entradaController.getEntradaById);
router.post('/', entradaController.createEntrada);

module.exports = router;
