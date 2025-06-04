
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Criar uma Transferência de Fundos
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
        await transacaoRemetente.save();
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
        await transacaoDestinatario.save();
        console.log('transacaoDestinatario SALVA com ID:', transacaoDestinatario._id);

        console.log('--- Transferência Concluída com Sucesso no Controller ---');
        res.status(200).json({
            message: 'Transferência realizada com sucesso!',
            saldoAtualRemetente: usuarioRemetente.saldoConta,
            transacao: transacaoRemetente
        });

    } catch (error) {
        console.error('ERRO DETALHADO NA TRANSFERÊNCIA:', error);
        console.error('Stack do erro:', error.stack);
        res.status(500).json({ message: 'Erro no servidor ao tentar realizar a transferência.', error: error.message });
    }
};

// Obter o histórico de transações do usuário logado
exports.getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
                                           .sort({ data: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Erro ao buscar histórico de transações:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar histórico de transações.' });
    }
};

// Realizar um Depósito na conta do usuário logado
exports.createDeposit = async (req, res) => {
    const { valor, descricao } = req.body;

    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ message: 'O valor do depósito deve ser um número positivo.' });
    }

    const usuarioLogadoId = req.user._id; // ID do usuário logado

    try {
        // TODO: Para produção, considerar atomicidade se houver mais operações complexas.
        const user = await User.findById(usuarioLogadoId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        user.saldoConta += valor;
        await user.save();

        const novaTransacao = new Transaction({
            user: user._id,
            tipo: 'deposito',
            valor,
            descricao: descricao || 'Depósito em conta',
            status: 'concluida'
        });
        await novaTransacao.save();

        console.log(`Depósito de ${valor} realizado para ${user.email}. Novo saldo: ${user.saldoConta}`);
        res.status(200).json({
            message: 'Depósito realizado com sucesso!',
            saldoAtual: user.saldoConta,
            transacao: novaTransacao
        });

    } catch (error) {
        console.error('Erro no depósito:', error);
        res.status(500).json({ message: 'Erro no servidor ao tentar realizar o depósito.' });
    }
};

// Realizar um Saque da conta do usuário logado
exports.createWithdrawal = async (req, res) => {
    const { valor, descricao } = req.body;

    if (typeof valor !== 'number' || valor <= 0) {
        return res.status(400).json({ message: 'O valor do saque deve ser um número positivo.' });
    }

    const usuarioLogadoId = req.user._id;

    try {
        // TODO: Para produção, considerar atomicidade.
        const user = await User.findById(usuarioLogadoId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (user.saldoConta < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o saque.' });
        }

        user.saldoConta -= valor;
        await user.save();

        const novaTransacao = new Transaction({
            user: user._id,
            tipo: 'saque',
            valor,
            descricao: descricao || 'Saque da conta',
            status: 'concluida'
        });
        await novaTransacao.save();

        console.log(`Saque de ${valor} realizado por ${user.email}. Novo saldo: ${user.saldoConta}`);
        res.status(200).json({
            message: 'Saque realizado com sucesso!',
            saldoAtual: user.saldoConta,
            transacao: novaTransacao
        });

    } catch (error) {
        console.error('Erro no saque:', error);
        res.status(500).json({ message: 'Erro no servidor ao tentar realizar o saque.' });
    }
};