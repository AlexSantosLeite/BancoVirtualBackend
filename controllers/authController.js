const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Função para gerar o token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expira em 1 dia
  });
};

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
exports.registerUser = async (req, res) => {
  // Verifica o resultado da validação que definimos na rota
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se houver erros, retorna o status 400 com a lista de erros
    return res.status(400).json({ errors: errors.array() });
  }

  // Se não houve erros de validação, o resto do código continua normalmente...
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    }

  } catch (err) {
    console.error('Erro no registro:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @route   POST /api/auth/login
// @desc    Autentica o usuário e retorna o token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, informe email e senha' });
    }
    const user = await User.findOne({ email }).select('+password');
    
    // Compara a senha e verifica se o usuário existe
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } else {
      // Mensagem genérica por segurança
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).send('Erro no servidor ao tentar fazer login');
  }
};
