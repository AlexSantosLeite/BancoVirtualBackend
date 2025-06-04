
// Obter perfil do usuário logado
// Como o middleware 'protect' já buscou e anexou o usuário a req.user,
// só precisamos retorná-lo.
exports.getUserProfile = async (req, res) => {
    // req.user foi adicionado pelo middleware 'protect'
    if (req.user) {
        res.json({
            id: req.user._id,
            nome: req.user.nome,
            email: req.user.email,
            saldoConta: req.user.saldoConta,
            dataCriacao: req.user.dataCriacao
        });
    } else {
        // Este else não deveria ser alcançado se o middleware 'protect' funcionar corretamente
        res.status(404).json({ message: 'Usuário não encontrado.' });
    }
};