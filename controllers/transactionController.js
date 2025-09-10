const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

exports.deposit = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { valor, descricao } = req.body;

    try {
        const user = await User.findById(req.user.id);

        // Atualiza o saldo do usuário (usando 'balance')
        user.balance += valor;
        await user.save();

        // Cria um registro da transação
        await Transaction.create({
            user: user.id,
            tipo: 'deposito',
            valor,
            descricao
        });
        
        // Retorna a resposta com o novo saldo (usando 'balance')
        res.status(200).json({ 
            message: 'Depósito realizado com sucesso!',
            balance: user.balance 
        });

    } catch (error) {
        console.error('Erro no depósito:', error);
        res.status(500).send('Erro no servidor');
    }
};

exports.createTransfer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { destinatarioEmail, valor, descricao } = req.body;

    try {
        const remetente = await User.findById(req.user.id);
        const destinatario = await User.findOne({ email: destinatarioEmail });

        if (remetente.email === destinatarioEmail) {
            return res.status(400).json({ message: 'Você não pode transferir para si mesmo.' });
        }
        if (!destinatario) {
            return res.status(404).json({ message: 'Usuário destinatário não encontrado.' });
        }
        if (remetente.balance < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente.' });
        }

        // Atualiza saldos (usando 'balance')
        remetente.balance -= valor;
        destinatario.balance += valor;

        await remetente.save();
        await destinatario.save();

        // Cria registro para o remetente
        await Transaction.create({
            user: remetente.id,
            tipo: 'transferencia_enviada',
            valor,
            descricao,
            parteContraria: {
                userId: destinatario.id,
                email: destinatario.email,
                name: destinatario.name 
            }
        });

        // Cria registro para o destinatário
        await Transaction.create({
            user: destinatario.id,
            tipo: 'transferencia_recebida',
            valor,
            descricao,
            parteContraria: {
                userId: remetente.id,
                email: remetente.email,
                name: remetente.name
            }
        });

        res.status(200).json({
            message: 'Transferência realizada com sucesso!',
            balance: remetente.balance
        });

    } catch (error) {
        console.error('ERRO NA TRANSFERÊNCIA:', error);
        res.status(500).send('Erro no servidor ao realizar a transferência.');
    }
};


exports.createWithdrawal = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { valor, descricao } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (user.balance < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o saque.' });
        }

        user.balance -= valor;
        await user.save();

        await Transaction.create({
            user: user.id,
            tipo: 'saque',
            valor,
            descricao,
        });

        res.status(200).json({
            message: 'Saque realizado com sucesso!',
            balance: user.balance,
        });

    } catch (error) {
        console.error('Erro no saque:', error);
        res.status(500).send('Erro no servidor ao tentar realizar o saque.');
    }
};


exports.getTransactionHistory = async (req, res) => {
    try {
        // Usando 'createdAt' para ordenação, que é adicionado pelo timestamps: true
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }); 
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).send('Erro no servidor ao buscar histórico.');
    }
};