const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalesDB');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error de conexión:', error);
    process.exit(1);
  }
};

module.exports = connectDB;