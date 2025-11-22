const { PrismaClient } = require('@prisma/client');
const mariadb = require('mariadb');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

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
  acquireTimeout: 30000,
  connectTimeout: 10000,
  idleTimeout: 600000,
  minimumIdle: 2
};

console.log('📊 Configuración de base de datos:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Crear pool de conexiones MariaDB/MySQL
const pool = mariadb.createPool(dbConfig);

// Crear adaptador
const adapter = new PrismaMariaDb(pool);

// Crear instancia de Prisma Client con el adaptador
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    // Probar conexión directa del pool primero
    const conn = await pool.getConnection();
    console.log('✅ Pool de MariaDB conectado');
    conn.release();
    
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
