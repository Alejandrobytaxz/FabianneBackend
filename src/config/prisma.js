const { PrismaClient } = require('@prisma/client');

// Crear instancia de Prisma Client directamente
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma conectado a MySQL correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    console.error('Detalles del error:', error);
    return false;
  }
};

// Función para desconectar de la base de datos
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Prisma desconectado de MySQL');
  } catch (error) {
    console.error('❌ Error al desconectar Prisma:', error.message);
  }
};

// Manejo de cierre de la aplicación
process.on('beforeExit', async () => {
  await disconnectDB();
});

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};
