
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Por favor, informe seu nome.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Por favor, informe seu email.'],
        unique: true, // Garante que cada email seja único no banco
        lowercase: true, // Converte o email para minúsculas antes de salvar
        match: [ // Validação simples para formato de email
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, informe um email válido.'
        ]
    },
    senha: {
        type: String,
        required: [true, 'Por favor, informe sua senha.'],
        minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
        select: false // Impede que o campo senha seja retornado em queries por padrão
    },
    saldoConta: {
        type: Number,
        default: 0 // Saldo inicial padrão é 0
    },
    dataCriacao: {
        type: Date,
        default: Date.now // Data de criação padrão é a data atual
    }
});

// Middleware (hook) do Mongoose para "hashear" a senha ANTES de salvar o usuário
UserSchema.pre('save', async function(next) {
    // Só executa esta função se a senha foi modificada (ou é nova)
    if (!this.isModified('senha')) {
        return next();
    }

    try {
        // Gera um "salt" para aumentar a segurança do hash
        const salt = await bcrypt.genSalt(10);
        // Cria o hash da senha usando o salt gerado
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar a senha enviada com a senha hasheada no banco
UserSchema.methods.compararSenha = async function(senhaEnviada) {
    return await bcrypt.compare(senhaEnviada, this.senha);
};

module.exports = mongoose.model('User', UserSchema);