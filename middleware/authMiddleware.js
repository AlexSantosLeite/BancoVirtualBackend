
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Nosso modelo de Usuário
require('dotenv').config({ path: '../.env' }); // Garanta que o caminho para .env está correto ou que já foi carregado globalmente

const protect = async (req, res, next) => {
    let token;

    // Verifica se o token está no header de Authorization e se começa com "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extrai o token do header (formato "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica e decodifica o token usando o nosso segredo JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Busca o usuário no banco de dados pelo ID que está no token
            //    e remove o campo 'senha' do resultado
            req.user = await User.findById(decoded.id).select('-senha');

            if (!req.user) {
                // Se o usuário não for encontrado (ex: token válido mas usuário deletado)
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }

            next(); // Se tudo estiver ok, chama o próximo middleware ou a rota protegida
        } catch (error) {
            console.error('Erro na autenticação do token:', error);
            res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};

module.exports = { protect };