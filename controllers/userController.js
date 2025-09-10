// @desc    Obtém os dados do perfil do usuário logado
// @route   GET /api/users/profile
// @access  Private (protegido por middleware)
const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      balance: req.user.balance,
      createdAt: req.user.createdAt
    });
  } else {
    // Este 'else' é uma segurança extra, mas não deve ser alcançado
    // se o middleware 'protect' estiver funcionando corretamente.
    res.status(404).json({ message: 'Usuário não encontrado.' });
  }
};

module.exports = {
  getUserProfile,
};