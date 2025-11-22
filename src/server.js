require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/prisma');

const PORT = process.env.PORT || 3000;

// Iniciar servidor y verificar conexión a la base de datos
const startServer = async () => {
  try {
    // Conectar Prisma a la base de datos
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
