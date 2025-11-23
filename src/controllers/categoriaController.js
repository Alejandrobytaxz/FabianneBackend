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
    
    const categoria = await prisma.categoria.create({
      data: { nombre, descripcion }
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
    
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nombre, descripcion }
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
    
    await prisma.categoria.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', details: error.message });
  }
};
