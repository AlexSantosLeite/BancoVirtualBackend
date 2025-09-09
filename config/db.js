
const mongoose = require('mongoose');
require('dotenv').config(); // Garante que process.env.MONGO_URI seja lido

const connectDB = async () => {
  try {
    // Tenta conectar ao MongoDB usando a URI do arquivo .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Se a conexão for bem-sucedida, exibe uma mensagem no console
    console.log(`MongoDB Conectado: ${conn.connection.host}`);

  } catch (error) {
    // Se ocorrer um erro na conexão, exibe o erro no console
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    
    // Encerra a aplicação com falha. Se não conseguir conectar ao DB, o servidor não deve rodar.
    process.exit(1);
  }
};

module.exports = connectDB;