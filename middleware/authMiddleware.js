const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Verifica se o cabeçalho de autorização existe e começa com "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token do cabeçalho
            token = req.headers.authorization.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Busca o usuário pelo ID do token e anexa à requisição (usando 'password')
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }

            // Continua para a próxima etapa
            next();

        } catch (error) {
            // Se jwt.verify falhar (token expirado, inválido, etc.)
            console.error('Erro na autenticação do token:', error);
            return res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    } else {
        // Se não houver cabeçalho de autorização ou não começar com "Bearer"
        return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};

module.exports = { protect };