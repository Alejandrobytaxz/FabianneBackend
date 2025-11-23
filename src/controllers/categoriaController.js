const { prisma } = require('../config/prisma');

// Obtener todas las categorías
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías', details: error.message });
  }
};

// Obtener categoría por ID
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        productos: true
      }
    });
    
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría', details: error.message });
  }
};

// Crear categoría
exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validación de campos requeridos
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    // Verificar si ya existe una categoría con el mismo nombre
    const categoriaExistente = await prisma.categoria.findFirst({
      where: { 
        nombre: nombre
      }
    });
    
    if (categoriaExistente) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    
    const categoria = await prisma.categoria.create({
      data: { 
        nombre: nombre.trim(), 
        descripcion: descripcion ? descripcion.trim() : null 
      }
    });
    
    res.status(201).json({ message: 'Categoría creada exitosamente', categoria });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría', details: error.message });
  }
};

// Actualizar categoría
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Validar que el ID sea válido
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }
    
    // Verificar que la categoría existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: idNum }
    });
    
    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    // Validar campos
    if (nombre !== undefined && nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría no puede estar vacío' });
    }
    
    // Verificar duplicados si se está cambiando el nombre
    if (nombre && nombre !== categoriaExistente.nombre) {
      const nombreDuplicado = await prisma.categoria.findFirst({
        where: { 
          nombre: nombre,
          NOT: { id: idNum }
        }
      });
      
      if (nombreDuplicado) {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
    }
    
    // Preparar datos para actualizar
    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion ? descripcion.trim() : null;
    
    const categoria = await prisma.categoria.update({
      where: { id: idNum },
      data: dataToUpdate
    });
    
    res.json({ message: 'Categoría actualizada exitosamente', categoria });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría', details: error.message });
  }
};

// Eliminar categoría
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }
    
    // Verificar si la categoría tiene productos asociados
    const categoria = await prisma.categoria.findUnique({
      where: { id: idNum },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });
    
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    if (categoria._count.productos > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la categoría porque tiene ${categoria._count.productos} producto(s) asociado(s)` 
      });
    }
    
    await prisma.categoria.delete({
      where: { id: idNum }
    });
    
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', details: error.message });
  }
};
