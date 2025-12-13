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
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ error: 'Error al obtener productos' });
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
    console.error('Error al obtener producto:', error.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear producto
exports.createProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoriaId, marca, precioCompra, precioVenta, stockMinimo, detalles } = req.body;
    
    // Validar campos requeridos
    if (!codigo || !nombre || !categoriaId || precioCompra == null || precioVenta == null || stockMinimo == null) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: codigo, nombre, categoriaId, precioCompra, precioVenta, stockMinimo' 
      });
    }

    // Convertir a números
    const categoriaIdNum = parseInt(categoriaId);
    const precioCompraNum = parseFloat(precioCompra);
    const precioVentaNum = parseFloat(precioVenta);
    const stockMinimoNum = parseInt(stockMinimo);

    // Validar que la categoría exista
    const categoriaExiste = await prisma.categoria.findUnique({
      where: { id: categoriaIdNum }
    });

    if (!categoriaExiste) {
      return res.status(400).json({ 
        error: `La categoría con ID ${categoriaIdNum} no existe` 
      });
    }
    
    const producto = await prisma.producto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        categoriaId: categoriaIdNum,
        marca,
        precioCompra: precioCompraNum,
        precioVenta: precioVentaNum,
        stockMinimo: stockMinimoNum,
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
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, categoriaId, marca, precioCompra, precioVenta, stockMinimo, activo } = req.body;
    
    // Construir objeto de actualización solo con campos definidos
    const updateData = {};
    if (codigo !== undefined) updateData.codigo = codigo;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (categoriaId !== undefined) updateData.categoriaId = parseInt(categoriaId);
    if (marca !== undefined) updateData.marca = marca;
    if (precioCompra !== undefined) updateData.precioCompra = parseFloat(precioCompra);
    if (precioVenta !== undefined) updateData.precioVenta = parseFloat(precioVenta);
    if (stockMinimo !== undefined) updateData.stockMinimo = parseInt(stockMinimo);
    if (activo !== undefined) updateData.activo = activo;
    
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        categoria: true,
        detalles: true
      }
    });
    
    res.json({ message: 'Producto actualizado exitosamente', producto });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
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
    console.error('Error al obtener stock:', error.message);
    res.status(500).json({ error: 'Error al obtener stock' });
  }
};
