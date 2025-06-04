
const express = require('express');
const router = express.Router();
const { createTransfer, getTransactionHistory } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware'); // Nosso middleware de proteção

// @route   POST api/transactions/transfer
// @desc    Realizar uma transferência de fundos entre usuários
// @access  Private (Protegida)
router.post('/transfer', protect, createTransfer);

// Futuramente, podemos adicionar outras rotas aqui, como:
router.get('/my-history', protect, getTransactionHistory);

module.exports = router;