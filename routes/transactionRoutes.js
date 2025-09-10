const express = require('express');
const router = express.Router();
const { deposit, createTransfer, createWithdrawal, getTransactionHistory } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Todas as rotas aqui são privadas e precisam de um token válido
router.use(protect);

// Rota de Histórico
router.get('/my-history', getTransactionHistory);

// Rota de Depósito
router.post(
    '/deposit', 
    [ check('valor', 'O valor do depósito deve ser um número positivo').isFloat({ gt: 0 }) ], 
    deposit
);

// Rota de Saque
router.post(
    '/withdrawal',
    [ check('valor', 'O valor do saque deve ser um número positivo').isFloat({ gt: 0 }) ],
    createWithdrawal
);

// Rota de Transferência
router.post(
    '/transfer',
    [
        check('destinatarioEmail', 'O email do destinatário é obrigatório').isEmail(),
        check('valor', 'O valor da transferência deve ser um número positivo').isFloat({ gt: 0 })
    ],
    createTransfer
);

module.exports = router;