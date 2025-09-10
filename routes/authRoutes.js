
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// 1. Importação da função 'check' do express-validator
const { check } = require('express-validator');

// 2. Na rota de registro, adicionei um array de regras de validação
router.post(
  '/register',
  [ // Este é o "inspetor de qualidade"
    check('name', 'O nome é obrigatório e não pode estar vazio.').not().isEmpty(),
    check('email', 'Por favor, inclua um email em formato válido.').isEmail(),
    check('password', 'A senha deve ter no mínimo 6 caracteres.').isLength({ min: 6 })
  ],
  registerUser // A função do controller só roda se as validações passarem
);

// A rota de login não precisa de validação aqui, já que a lógica dela já verifica os campos
router.post('/login', loginUser);

module.exports = router;