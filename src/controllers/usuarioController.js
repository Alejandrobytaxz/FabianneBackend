const { prisma } = require('../config/prisma');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        cargo: true,
        email: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        cargo: true,
        email: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
  }
};

// Crear un nuevo usuario (con hash de contraseña)
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, cargo, email, password } = req.body;
    
    // Verificar si el email ya existe
    const emailExiste = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (emailExiste) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }
    
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const usuario = await prisma.usuario.create({
      data: { 
        nombre, 
        cargo, 
        email, 
        password: hashedPassword 
      }
    });
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        cargo: usuario.cargo,
        email: usuario.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', details: error.message });
  }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, email, activo, password } = req.body;
    
    const updateData = { nombre, cargo, email, activo };
    
    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        cargo: true,
        email: true,
        activo: true,
        updatedAt: true
      }
    });
    
    res.json({ message: 'Usuario actualizado exitosamente', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
  }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
};
