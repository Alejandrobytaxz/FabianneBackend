# Autenticación JWT - Calzado Fabianne API

## 🔐 Sistema de Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación y **bcrypt** para el hash de contraseñas.

---

## 📍 Endpoints de Autenticación

### 1. Registro de Usuario
**POST** `/api/auth/register`

Registra un nuevo usuario en el sistema con contraseña hasheada.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "cargo": "Administrador",
  "email": "juan@fabianne.com",
  "password": "miPassword123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "cargo": "Administrador",
    "email": "juan@fabianne.com",
    "activo": true
  }
}
```

---

### 2. Login
**POST** `/api/auth/login`

Inicia sesión y devuelve un token JWT.

**Body:**
```json
{
  "email": "juan@fabianne.com",
  "password": "miPassword123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "cargo": "Administrador",
    "email": "juan@fabianne.com",
    "activo": true
  }
}
```

---

### 3. Verificar Token
**GET** `/api/auth/verify`

Verifica si el token es válido y devuelve información del usuario.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "valid": true,
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "cargo": "Administrador",
    "email": "juan@fabianne.com",
    "activo": true,
    "createdAt": "2025-11-22T10:00:00.000Z"
  }
}
```

---

### 4. Cambiar Contraseña
**POST** `/api/auth/change-password`

Permite al usuario cambiar su contraseña.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "passwordActual": "miPassword123",
  "passwordNueva": "nuevoPassword456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 🔒 Rutas Protegidas

Las siguientes rutas **requieren autenticación** (token JWT en el header):

- **Usuarios:** `/api/usuarios/*`
- **Productos:** `/api/productos/*`
- **Entradas:** `/api/entradas/*`
- **Salidas:** `/api/salidas/*`

### Cómo usar el token

Incluye el token en el header `Authorization` de tus peticiones:

```
Authorization: Bearer TU_TOKEN_AQUI
```

**Ejemplo con fetch:**
```javascript
fetch('http://localhost:3000/api/productos', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

**Ejemplo con curl:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:3000/api/productos
```

---

## ⚙️ Configuración

Las siguientes variables de entorno controlan el comportamiento de JWT:

```env
JWT_SECRET=fabiane_calzado_secret_key_2025_super_secure
JWT_EXPIRES_IN=24h
```

- **JWT_SECRET:** Clave secreta para firmar tokens (¡cámbiala en producción!)
- **JWT_EXPIRES_IN:** Tiempo de expiración del token (ej: 24h, 7d, 30m)

---

## 🛡️ Seguridad

✅ **Contraseñas hasheadas** con bcrypt (10 rounds de salt)
✅ **Tokens JWT** con expiración configurable
✅ **Validación de email único** al registrar
✅ **Verificación de usuario activo** al hacer login
✅ **Protección de rutas** con middleware de autenticación

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o email ya registrado |
| 401 | Credenciales inválidas o token expirado/inválido |
| 404 | Usuario no encontrado |
| 500 | Error interno del servidor |

---

## 📝 Flujo de Autenticación

1. Usuario se registra → Recibe token
2. Usuario hace login → Recibe token
3. Usuario incluye token en headers para acceder a rutas protegidas
4. El middleware verifica el token en cada petición
5. Si el token es válido, la petición continúa
6. Si el token es inválido/expirado, retorna error 401
