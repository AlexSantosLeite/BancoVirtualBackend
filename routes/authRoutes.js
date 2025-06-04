
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); // Vamos criar este arquivo em seguida

// @route   POST api/auth/register
// @desc    Registrar um novo usuário
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', loginUser);

module.exports = router;