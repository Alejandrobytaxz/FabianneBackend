const { PrismaClient } = require('@prisma/client');
const mariadb = require('mariadb');
const { PrismaMariadb } = require('@prisma/adapter-mariadb');

// Extraer información de la URL de la base de datos
const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/calzado_fabianne';
const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/);

const dbConfig = {
  host: urlMatch ? urlMatch[3] : 'localhost',
  port: urlMatch ? parseInt(urlMatch[4]) : 3306,
  user: urlMatch ? urlMatch[1] : 'root',
  password: urlMatch ? urlMatch[2] : '',
  database: urlMatch ? urlMatch[5] : 'calzado_fabianne',
  connectionLimit: 10,
};

// Crear pool de conexiones MariaDB/MySQL
const pool = mariadb.createPool(dbConfig);

// Crear adaptador
const adapter = new PrismaMariadb(pool);

// Crear instancia de Prisma Client con el adaptador
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma conectado a MySQL correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar Prisma a MySQL:', error.message);
    return false;
  }
};

// Función para desconectar de la base de datos
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
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
