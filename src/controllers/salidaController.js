const { prisma } = require('../config/prisma');

// Obtener todas las salidas
exports.getAllSalidas = async (req, res) => {
  try {
    const salidas = await prisma.salida.findMany({
      include: {
        usuario: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { fechaSalida: 'desc' }
    });
    res.json(salidas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener salidas', details: error.message });
  }
};

// Obtener salida por ID
exports.getSalidaById = async (req, res) => {
  try {
    const { id } = req.params;
    const salida = await prisma.salida.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    
    if (!salida) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }
    
    res.json(salida);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener salida', details: error.message });
  }
};

// Crear nueva salida (con actualización automática de stock)
exports.createSalida = async (req, res) => {
  try {
    const { numeroDocumento, usuarioId, tipoSalida, destinatario, observaciones, detalles } = req.body;
    
    // Validar campos requeridos
    if (!numeroDocumento || !usuarioId || !tipoSalida || !detalles || detalles.length === 0) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: numeroDocumento, usuarioId, tipoSalida, detalles' 
      });
    }

    // Validar detalles
    for (const detalle of detalles) {
      if (!detalle.productoId || !detalle.talla || !detalle.color || !detalle.cantidad || detalle.precioUnitario == null) {
        return res.status(400).json({ 
          error: 'Cada detalle debe tener: productoId, talla, color, cantidad, precioUnitario' 
        });
      }
    }
    
    // Calcular total con conversión a número
    const total = detalles.reduce((sum, item) => {
      return sum + (parseFloat(item.cantidad) * parseFloat(item.precioUnitario));
    }, 0);

    const usuarioIdNum = parseInt(usuarioId);
    
    // Usar transacción para crear salida y actualizar stock
    const salida = await prisma.$transaction(async (tx) => {
      // Verificar stock disponible para cada producto
      for (const detalle of detalles) {
        const productoIdNum = parseInt(detalle.productoId);
        const cantidadNum = parseInt(detalle.cantidad);

        const detalleProducto = await tx.detalleProducto.findFirst({
          where: {
            productoId: productoIdNum,
            talla: detalle.talla,
            color: detalle.color
          }
        });
        
        if (!detalleProducto) {
          throw new Error(`Producto no encontrado: ${detalle.talla} - ${detalle.color}`);
        }
        
        if (detalleProducto.stock < cantidadNum) {
          throw new Error(`Stock insuficiente para: ${detalle.talla} - ${detalle.color}. Stock disponible: ${detalleProducto.stock}`);
        }
      }
      
      // Crear salida
      const nuevaSalida = await tx.salida.create({
        data: {
          numeroDocumento,
          usuarioId: usuarioIdNum,
          tipoSalida,
          destinatario,
          observaciones,
          total,
          detalles: {
            create: detalles.map(detalle => ({
              productoId: parseInt(detalle.productoId),
              talla: detalle.talla,
              color: detalle.color,
              cantidad: parseInt(detalle.cantidad),
              precioUnitario: parseFloat(detalle.precioUnitario),
              subtotal: parseInt(detalle.cantidad) * parseFloat(detalle.precioUnitario)
            }))
          }
        },
        include: {
          detalles: true
        }
      });
      
      // Actualizar stock de cada producto
      for (const detalle of detalles) {
        const productoIdNum = parseInt(detalle.productoId);
        const cantidadNum = parseInt(detalle.cantidad);

        const detalleProducto = await tx.detalleProducto.findFirst({
          where: {
            productoId: productoIdNum,
            talla: detalle.talla,
            color: detalle.color
          }
        });
        
        await tx.detalleProducto.update({
          where: { id: detalleProducto.id },
          data: { stock: { decrement: cantidadNum } }
        });
      }
      
      return nuevaSalida;
    });
    
    res.status(201).json({ message: 'Salida registrada exitosamente', salida });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear salida', details: error.message });
  }
};
