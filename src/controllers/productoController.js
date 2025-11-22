const { prisma } = require('../config/prisma');

// Obtener todos los productos con sus detalles
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        detalles: true
      }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
};

// Obtener producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        detalles: true
      }
    });
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', details: error.message });
  }
};

// Crear producto
exports.createProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoriaId, marca, precioCompra, precioVenta, stockMinimo, detalles } = req.body;
    
    const producto = await prisma.producto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        categoriaId,
        marca,
        precioCompra,
        precioVenta,
        stockMinimo,
        detalles: {
          create: detalles || []
        }
      },
      include: {
        categoria: true,
        detalles: true
      }
    });
    
    res.status(201).json({ message: 'Producto creado exitosamente', producto });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto', details: error.message });
  }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, categoriaId, marca, precioCompra, precioVenta, stockMinimo, activo } = req.body;
    
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { codigo, nombre, descripcion, categoriaId, marca, precioCompra, precioVenta, stockMinimo, activo },
      include: {
        categoria: true,
        detalles: true
      }
    });
    
    res.json({ message: 'Producto actualizado exitosamente', producto });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
  }
};

// Obtener stock total de un producto
exports.getStockProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const detalles = await prisma.detalleProducto.findMany({
      where: { productoId: parseInt(id) },
      select: {
        talla: true,
        color: true,
        stock: true
      }
    });
    
    const stockTotal = detalles.reduce((sum, detalle) => sum + detalle.stock, 0);
    
    res.json({ stockTotal, detalles });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stock', details: error.message });
  }
};
