const { prisma } = require('../config/prisma');

// Obtener todas las entradas
exports.getAllEntradas = async (req, res) => {
  try {
    const entradas = await prisma.entrada.findMany({
      include: {
        proveedor: true,
        usuario: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { fechaEntrada: 'desc' }
    });
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entradas', details: error.message });
  }
};

// Obtener entrada por ID
exports.getEntradaById = async (req, res) => {
  try {
    const { id } = req.params;
    const entrada = await prisma.entrada.findUnique({
      where: { id: parseInt(id) },
      include: {
        proveedor: true,
        usuario: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    
    if (!entrada) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    res.json(entrada);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entrada', details: error.message });
  }
};

// Crear nueva entrada (con actualización automática de stock)
exports.createEntrada = async (req, res) => {
  try {
    const { numeroDocumento, proveedorId, usuarioId, tipoDocumento, observaciones, detalles } = req.body;
    
    // Calcular total
    const total = detalles.reduce((sum, item) => {
      return sum + (parseFloat(item.cantidad) * parseFloat(item.precioUnitario));
    }, 0);
    
    // Usar transacción para crear entrada y actualizar stock
    const entrada = await prisma.$transaction(async (tx) => {
      // Crear entrada
      const nuevaEntrada = await tx.entrada.create({
        data: {
          numeroDocumento,
          proveedorId,
          usuarioId,
          tipoDocumento,
          observaciones,
          total,
          detalles: {
            create: detalles.map(detalle => ({
              productoId: detalle.productoId,
              talla: detalle.talla,
              color: detalle.color,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              subtotal: detalle.cantidad * detalle.precioUnitario
            }))
          }
        },
        include: {
          detalles: true
        }
      });
      
      // Actualizar stock de cada producto
      for (const detalle of detalles) {
        // Buscar si existe el detalle del producto
        const detalleExistente = await tx.detalleProducto.findFirst({
          where: {
            productoId: detalle.productoId,
            talla: detalle.talla,
            color: detalle.color
          }
        });
        
        if (detalleExistente) {
          // Incrementar stock existente
          await tx.detalleProducto.update({
            where: { id: detalleExistente.id },
            data: { stock: { increment: detalle.cantidad } }
          });
        } else {
          // Crear nuevo detalle de producto
          await tx.detalleProducto.create({
            data: {
              productoId: detalle.productoId,
              talla: detalle.talla,
              color: detalle.color,
              stock: detalle.cantidad
            }
          });
        }
      }
      
      return nuevaEntrada;
    });
    
    res.status(201).json({ message: 'Entrada registrada exitosamente', entrada });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear entrada', details: error.message });
  }
};
