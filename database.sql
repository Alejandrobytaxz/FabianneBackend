-- Base de datos para Calzado Fabianne
CREATE DATABASE IF NOT EXISTS calzado_fabianne;
USE calzado_fabianne;

-- Tabla de ejemplo (usuarios)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'empleado', 'cliente') DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar un usuario de prueba
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Admin', 'admin@fabianne.com', 'password123', 'admin');
