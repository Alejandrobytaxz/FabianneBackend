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
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
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
        rol: true,
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
    console.error('Error al obtener usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Crear un nuevo usuario (con hash de contraseña)
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, cargo, email, password, rol } = req.body;
    
    // Validar rol
    const rolValido = rol || 'Personal';
    if (rolValido !== 'Administrador' && rolValido !== 'Personal') {
      return res.status(400).json({ 
        error: 'El rol debe ser "Administrador" o "Personal"' 
      });
    }
    
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
        password: hashedPassword,
        rol: rolValido
      }
    });
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        cargo: usuario.cargo,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, email, activo, password, rol } = req.body;
    
    const updateData = { nombre, cargo, email, activo };
    
    // Validar rol si se proporciona
    if (rol) {
      if (rol !== 'Administrador' && rol !== 'Personal') {
        return res.status(400).json({ 
          error: 'El rol debe ser "Administrador" o "Personal"' 
        });
      }
      updateData.rol = rol;
    }
    
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
        rol: true,
        activo: true,
        updatedAt: true
      }
    });
    
    res.json({ message: 'Usuario actualizado exitosamente', usuario });
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'Error al actualizar usuario' });
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
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
