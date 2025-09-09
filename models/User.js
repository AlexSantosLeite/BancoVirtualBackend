const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, insira um nome.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor, insira um email.'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido.'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor, insira uma senha.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
    select: false
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hook do Mongoose para criptografar a senha ANTES de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);