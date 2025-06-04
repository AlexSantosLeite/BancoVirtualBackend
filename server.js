
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); // Carrega variáveis de ambiente do .env

// Conecta ao Banco de Dados
connectDB();

const app = express();
app.use(cors())

// parsear JSON no corpo das requisições
app.use(express.json());

// Rota de Teste
app.get('/', (req, res) => res.send('API do Banco Virtual está rodando!'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor backend rodando na porta ${PORT}`));