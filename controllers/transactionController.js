// Dentro de controllers/transactionController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');
// const mongoose = require('mongoose'); // Não é necessário para startSession se removemos, mas pode ser útil para outras coisas do mongoose se precisar. Deixe comentado por ora.

exports.createTransfer = async (req, res) => {
    const { destinatarioEmail, valor, descricao } = req.body;

    if (!destinatarioEmail || !valor) {
        return res.status(400).json({ message: 'Email do destinatário e valor são obrigatórios.' });
    }
    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ message: 'O valor da transferência deve ser um número positivo.' });
    }

    const remetente = req.user;

    if (remetente.email === destinatarioEmail) {
        return res.status(400).json({ message: 'Você não pode transferir fundos para si mesmo.' });
    }

    try {
        console.log('--- Iniciando Transferência ---');
        const usuarioRemetente = await User.findById(remetente._id);
        console.log('Remetente encontrado:', usuarioRemetente.email, 'Saldo:', usuarioRemetente.saldoConta);

        if (!usuarioRemetente || usuarioRemetente.saldoConta < valor) {
            console.log('Saldo insuficiente ou remetente não encontrado.');
            return res.status(400).json({ message: 'Saldo insuficiente para realizar a transferência.' });
        }

        const usuarioDestinatario = await User.findOne({ email: destinatarioEmail });
        if (!usuarioDestinatario) {
            console.log('Destinatário não encontrado com email:', destinatarioEmail);
            return res.status(404).json({ message: 'Usuário destinatário não encontrado.' });
        }
        console.log('Destinatário encontrado:', usuarioDestinatario.email, 'Saldo:', usuarioDestinatario.saldoConta);

        // Atualizações de saldo
        usuarioRemetente.saldoConta -= valor;
        usuarioDestinatario.saldoConta += valor;

        console.log('Saldos antes de salvar: Remetente:', usuarioRemetente.saldoConta, 'Destinatário:', usuarioDestinatario.saldoConta);
        await usuarioRemetente.save();
        await usuarioDestinatario.save();
        console.log('Saldos atualizados e salvos.');

        // Criar os registros de transação
        const transacaoRemetente = new Transaction({
            user: usuarioRemetente._id,
            tipo: 'transferencia_enviada',
            valor,
            parteContraria: {
                userId: usuarioDestinatario._id,
                email: usuarioDestinatario.email,
                nome: usuarioDestinatario.nome
            },
            descricao,
            status: 'concluida'
        });
        console.log('Tentando salvar transacaoRemetente:', JSON.stringify(transacaoRemetente, null, 2));
        await transacaoRemetente.save(); // Ponto crítico
        console.log('transacaoRemetente SALVA com ID:', transacaoRemetente._id);

        const transacaoDestinatario = new Transaction({
            user: usuarioDestinatario._id,
            tipo: 'transferencia_recebida',
            valor,
            parteContraria: {
                userId: usuarioRemetente._id,
                email: usuarioRemetente.email,
                nome: usuarioRemetente.nome
            },
            descricao,
            status: 'concluida'
        });
        console.log('Tentando salvar transacaoDestinatario:', JSON.stringify(transacaoDestinatario, null, 2));
        await transacaoDestinatario.save(); // Ponto crítico
        console.log('transacaoDestinatario SALVA com ID:', transacaoDestinatario._id);

        console.log('--- Transferência Concluída com Sucesso no Controller ---');
        res.status(200).json({
            message: 'Transferência realizada com sucesso!',
            saldoAtualRemetente: usuarioRemetente.saldoConta,
            transacao: transacaoRemetente // Retorna a transação do remetente
        });

    } catch (error) {
        console.error('ERRO DETALHADO NA TRANSFERÊNCIA:', error); // Log mais detalhado do erro
        console.error('Stack do erro:', error.stack);
        res.status(500).json({ message: 'Erro no servidor ao tentar realizar a transferência.', error: error.message });
    }
};

// Nova função para obter o histórico de transações
exports.getTransactionHistory = async (req, res) => {
    try {
        // O ID do usuário logado é obtido de req.user, que foi setado pelo middleware 'protect'
        const transactions = await Transaction.find({ user: req.user._id })
                                           .sort({ data: -1 }); // Ordena pela data, mais recentes primeiro

        res.status(200).json(transactions); // Retorna a lista de transações (ou um array vazio)

    } catch (error) {
        console.error('Erro ao buscar histórico de transações:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar histórico de transações.' });
    }
};