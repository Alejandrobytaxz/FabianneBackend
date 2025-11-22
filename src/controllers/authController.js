const { prisma } = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar nuevo usuario
exports.register = async (req, res) => {
  try {
    const { nombre, cargo, email, password } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !cargo || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
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
    
    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        cargo,
        email,
        password: hashedPassword
      }
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nombre: usuario.nombre,
        cargo: usuario.cargo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        cargo: usuario.cargo,
        email: usuario.email,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario', 
      details: error.message 
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({ 
        error: 'Usuario inactivo. Contacte al administrador' 
      });
    }
    
    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nombre: usuario.nombre,
        cargo: usuario.cargo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        cargo: usuario.cargo,
        email: usuario.email,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión', 
      details: error.message 
    });
  }
};

// Verificar token
exports.verifyToken = async (req, res) => {
  try {
    // El usuario ya está en req.user gracias al middleware
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        cargo: true,
        email: true,
        activo: true,
        createdAt: true
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      valid: true,
      usuario
    });
  } catch (error) {
    console.error('Error en verifyToken:', error);
    res.status(500).json({ 
      error: 'Error al verificar token', 
      details: error.message 
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuarioId = req.user.id;
    
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ 
        error: 'Se requiere la contraseña actual y la nueva' 
      });
    }
    
    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });
    
    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Contraseña actual incorrecta' 
      });
    }
    
    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordNueva, saltRounds);
    
    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({ 
      error: 'Error al cambiar contraseña', 
      details: error.message 
    });
  }
};
