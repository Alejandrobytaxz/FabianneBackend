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
    console.error('Error al obtener entradas:', error.message);
    res.status(500).json({ error: 'Error al obtener entradas' });
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
    console.error('Error al obtener entrada:', error.message);
    res.status(500).json({ error: 'Error al obtener entrada' });
  }
};

// Crear nueva entrada (con actualización automática de stock)
exports.createEntrada = async (req, res) => {
  try {
    const { numeroDocumento, proveedorId, usuarioId, tipoDocumento, observaciones, detalles } = req.body;
    
    // Validar campos requeridos
    if (!numeroDocumento || !usuarioId || !tipoDocumento || !detalles || detalles.length === 0) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: numeroDocumento, usuarioId, tipoDocumento, detalles' 
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
    
    // Preparar datos de entrada
    const entradaData = {
      numeroDocumento,
      usuarioId: usuarioIdNum,
      tipoDocumento,
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
    };
    
    // Solo agregar proveedorId si tiene un valor válido (número mayor a 0)
    if (proveedorId !== undefined && proveedorId !== null && proveedorId !== '') {
      const proveedorIdNum = parseInt(proveedorId);
      if (!isNaN(proveedorIdNum) && proveedorIdNum > 0) {
        entradaData.proveedorId = proveedorIdNum;
      }
    }
    
    // Usar transacción para crear entrada y actualizar stock
    const entrada = await prisma.$transaction(async (tx) => {
      // Crear entrada
      const nuevaEntrada = await tx.entrada.create({
        data: entradaData,
        include: {
          detalles: true
        }
      });
      
      // Actualizar stock de cada producto
      for (const detalle of detalles) {
        const productoIdNum = parseInt(detalle.productoId);
        const cantidadNum = parseInt(detalle.cantidad);

        // Buscar si existe el detalle del producto
        const detalleExistente = await tx.detalleProducto.findFirst({
          where: {
            productoId: productoIdNum,
            talla: detalle.talla,
            color: detalle.color
          }
        });
        
        if (detalleExistente) {
          // Incrementar stock existente
          await tx.detalleProducto.update({
            where: { id: detalleExistente.id },
            data: { stock: { increment: cantidadNum } }
          });
        } else {
          // Crear nuevo detalle de producto
          await tx.detalleProducto.create({
            data: {
              productoId: productoIdNum,
              talla: detalle.talla,
              color: detalle.color,
              stock: cantidadNum
            }
          });
        }
      }
      
      return nuevaEntrada;
    });
    
    res.status(201).json({ message: 'Entrada registrada exitosamente', entrada });
  } catch (error) {
    console.error('Error al crear entrada:', error.message);
    res.status(500).json({ error: 'Error al crear entrada' });
  }
};
