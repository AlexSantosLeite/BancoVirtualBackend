
const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController'); // Vamos criar este arquivo
const { protect } = require('../middleware/authMiddleware'); // Nosso middleware de proteção

// @route   GET api/users/me
// @desc    Obter perfil do usuário logado
// @access  Private (Protegida)
router.get('/me', protect, getUserProfile); // Note o 'protect' aqui antes do getUserProfile

module.exports = router;