const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController'); // Vamos criar essa função
const { protect } = require('../middleware/authMiddleware'); // Importe o nosso "segurança"

// Qualquer requisição para GET /api/users/profile passará PRIMEIRO pelo middleware 'protect'
// Se o token for válido, ele chamará a função 'getUserProfile'
router.get('/profile', protect, getUserProfile);

module.exports = router;