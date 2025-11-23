const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No se proporcionó token de autenticación' 
      });
    }
    
    // El token debe venir en formato: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Error al verificar autenticación',
      details: error.message 
    });
  }
};

// Middleware opcional - no requiere token pero lo procesa si existe
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      cargo: decoded.cargo,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    // Si hay error, simplemente continúa sin usuario
    next();
  }
};

// Middleware para verificar que el usuario es Administrador
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticación requerida' 
    });
  }
  
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de Administrador' 
    });
  }
  
  next();
};

// Middleware para verificar que el usuario es Administrador o Personal
const isAdminOrPersonal = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticación requerida' 
    });
  }
  
  if (req.user.rol !== 'Administrador' && req.user.rol !== 'Personal') {
    return res.status(403).json({ 
      error: 'Acceso denegado' 
    });
  }
  
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  isAdmin,
  isAdminOrPersonal
};
