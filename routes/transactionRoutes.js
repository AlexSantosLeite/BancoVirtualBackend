
const express = require('express');
const router = express.Router();
const { 
    createTransfer, 
    getTransactionHistory, 
    createDeposit, 
    createWithdrawal 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware'); // Nosso middleware de proteção


router.post('/transfer', protect, createTransfer);


router.get('/my-history', protect, getTransactionHistory);


router.post('/deposit', protect, createDeposit); // <-- NOVA ROTA PARA DEPÓSITO


router.post('/withdraw', protect, createWithdrawal); // <-- NOVA ROTA PARA SAQUE

module.exports = router;