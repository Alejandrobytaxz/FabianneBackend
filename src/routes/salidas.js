const express = require('express');
const router = express.Router();
const salidaController = require('../controllers/salidaController');

router.get('/', salidaController.getAllSalidas);
router.get('/:id', salidaController.getSalidaById);
router.post('/', salidaController.createSalida);

module.exports = router;
