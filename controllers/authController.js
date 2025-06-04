
const User = require('../models/User'); // Nosso modelo de Usuário
const bcrypt = require('bcryptjs'); // Para comparar senhas (embora o método esteja no model)
const jwt = require('jsonwebtoken'); // Para gerar o token JWT
require('dotenv').config({ path: '../.env' }); // Ajuste o caminho se o .env não estiver na raiz do projeto em relação a este arquivo

// Função para gerar o Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expira em 30 dias (ajuste conforme necessário)
    });
};

// Registrar um novo usuário
exports.registerUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // 1. Verificar se o usuário já existe pelo email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Usuário com este email já existe.' });
        }

        // 2. Criar uma nova instância do usuário (a senha será hasheada pelo hook pre-save no model)
        user = new User({
            nome,
            email,
            senha, // A senha em texto plano é passada aqui, o model cuida do hash
        });

        // 3. Salvar o usuário no banco de dados
        await user.save();

        // 4. Gerar o token JWT
        const token = generateToken(user._id);

        // 5. Retornar o token e informações básicas do usuário (sem a senha)
        res.status(201).json({
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                saldoConta: user.saldoConta
            },
            message: "Usuário registrado com sucesso!"
        });

    } catch (error) {
        console.error('Erro no registro:', error.message);
        // Verificar se é um erro de validação do Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(' ') });
        }
        res.status(500).json({ message: 'Erro no servidor ao tentar registrar usuário.' });
    }
};

// Autenticar (Login) um usuário existente
exports.loginUser = async (req, res) => {
    console.log('Conteúdo de req.body no login (início da função):', req.body);
    console.log('Tipo de req.body:', typeof req.body);
    console.log('Chaves de req.body:', Object.keys(req.body)); // Para ver as chaves exatas

    const { email, password: senha } = req.body;

    console.log('Valor de "email" após desestruturação:', email, '-- (tipo:', typeof email, ')');
    console.log('Valor de "senha" após desestruturação:', senha, '-- (tipo:', typeof senha, ')');

    console.log('Avaliando condição: !email é', !email);
    console.log('Avaliando condição: !senha é', !senha);
    console.log('Avaliando condição: (!email || !senha) é', (!email || !senha));

    try {
        if (!email || !senha) {
            console.log('Dentro do IF: A condição (!email || !senha) foi VERDADEIRA.');
            return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
        }
        
        console.log('Dentro do TRY, após o IF: A condição (!email || !senha) foi FALSA. Prosseguindo com o login...');

        // 2. Encontrar o usuário pelo email (e selecionar a senha, já que está com select:false no model)
        const user = await User.findOne({ email }).select('+senha');
        if (!user) {
            console.log('Usuário não encontrado com o email:', email);
            return res.status(401).json({ message: 'Credenciais inválidas.' }); // Usuário não encontrado
        }
        console.log('Usuário encontrado:', user.email);

        // 3. Comparar a senha enviada com a senha hasheada no banco
        const isMatch = await user.compararSenha(senha); // 'senha' aqui deve ser a senha do req.body
        console.log('Resultado da comparação de senha (isMatch):', isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' }); // Senha incorreta
        }

        // 4. Gerar o token JWT
        const token = generateToken(user._id); // generateToken precisa estar definida ou importada
        console.log('Token JWT gerado.');

        // 5. Retornar o token e informações básicas do usuário
        res.status(200).json({
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                saldoConta: user.saldoConta
            },
            message: "Login realizado com sucesso!"
        });

    } catch (error) {
        console.error('Erro no login (bloco catch):', error.message);
        console.error('Stack do erro no login:', error.stack); // Adiciona o stack trace para mais detalhes
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
};
