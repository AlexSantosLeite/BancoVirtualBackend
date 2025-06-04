
const mongoose = require('mongoose');
require('dotenv').config(); // Para carregar as variáveis do .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            
        });
        console.log('MongoDB Conectado com Sucesso!');
    } catch (err) {
        console.error('Erro ao conectar com MongoDB:', err.message);
        // Encerra o processo com falha
        process.exit(1);
    }
};

module.exports = connectDB;