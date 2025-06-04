
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    // Usuário ao qual esta transação pertence (quem está vendo este registro no seu histórico)
    user: {
        type: Schema.Types.ObjectId, // Referência ao ID do usuário no modelo User
        ref: 'User',                 // Nome do modelo que está sendo referenciado
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['transferencia_enviada', 'transferencia_recebida', 'deposito', 'saque'] // Tipos de transação permitidos
    },
    valor: {
        type: Number,
        required: true,
        validate: { // Garante que o valor seja positivo
            validator: function(v) {
                return v > 0;
            },
            message: props => `${props.value} não é um valor válido! O valor deve ser positivo.`
        }
    },
    // Informações da contraparte na transação
    parteContraria: {
        userId: { // ID do usuário da contraparte (se for uma transferência interna)
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        email: { // Email da contraparte (pode ser usado para identificar quem enviou/recebeu)
            type: String,
            trim: true,
            lowercase: true
        },
        nome: { // Nome da contraparte (denormalizado para facilitar a exibição)
            type: String,
            trim: true
        }
    },
    descricao: {
        type: String,
        trim: true,
        maxlength: [100, 'A descrição não pode exceder 100 caracteres.']
    },
    data: {
        type: Date,
        default: Date.now // Data da transação padrão é a data atual
    },
    status: { // Status da transação (para simplificar, vamos focar em 'concluida')
        type: String,
        default: 'concluida',
        enum: ['concluida', 'pendente', 'falhou']
    }
});

// Opcional: Adicionar um índice para buscas mais rápidas por usuário e data
TransactionSchema.index({ user: 1, data: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
console.log('Mongoose está usando a coleção para Transaction:', mongoose.model('Transaction').collection.name);