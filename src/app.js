const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const entradasRoutes = require('./routes/entradas');
const salidasRoutes = require('./routes/salidas');

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Calzado Fabianne - Sistema de Gestión de Almacén',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      entradas: '/api/entradas',
      salidas: '/api/salidas'
    }
  });
});

// Usar rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/salidas', salidasRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

module.exports = app;
