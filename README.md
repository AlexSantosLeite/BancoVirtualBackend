# Banco Virtual API (Backend)

Esta é a API RESTful para o projeto Banco Virtual, responsável por toda a lógica de negócio, autenticação de usuários e gerenciamento de transações.

---

## ✨ Funcionalidades Principais

-   **Autenticação Segura:** Sistema de registro e login com senhas criptografadas e tokens JWT.
-   **Proteção de Rotas:** Middleware de autenticação para proteger rotas sensíveis.
-   **Operações Bancárias:** Endpoints para Depósito, Saque e Transferência entre usuários.
-   **Validação de Dados:** Validação robusta de entradas para garantir a integridade dos dados.
-   **Histórico de Transações:** Endpoint para consultar o histórico de transações de um usuário.

---

## 🛠️ Tecnologias Utilizadas

-   **Node.js:** Ambiente de execução JavaScript.
-   **Express.js:** Framework para construção da API.
-   **MongoDB:** Banco de dados NoSQL para armazenamento de dados.
-   **Mongoose:** ODM para modelagem de objetos do MongoDB.
-   **JSON Web Token (JWT):** Para autenticação baseada em tokens.
-   **Bcrypt.js:** Para criptografia de senhas.
-   **Express-validator:** Para validação de dados de entrada.
-   **Dotenv:** Para gerenciamento de variáveis de ambiente.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [MongoDB](https://www.mongodb.com/try/download/community) (serviço precisa estar em execução localmente)

### Passos para Instalação

1.  **Clone este repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_BACKEND]
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd BancoVirtualBackend
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Crie o arquivo de variáveis de ambiente:**
    -   Crie um arquivo chamado `.env` na raiz do projeto.
    -   Adicione as seguintes variáveis nele:
        ```env
        MONGO_URI=mongodb://localhost:27017/banco-virtual-db
        JWT_SECRET=seu_segredo_super_secreto_aqui
        PORT=5000
        ```

5.  **Inicie o servidor:**
    ```bash
    npm start
    ```
    O servidor estará rodando em `http://localhost:5000`.

---

## Endpoints da API

| Método | Rota                          | Descrição                               | Acesso   |
| :----- | :------------------------     | :------------------------------------   | :------- |
| `POST` | `/api/auth/register`          | Registra um novo usuário.               | Público  |
| `POST` | `/api/auth/login`             | Autentica um usuário e retorna token.   | Público  |
| `GET`  | `/api/users/profile`          | Busca dados do usuário logado.          | Privado  |
| `POST` | `/api/transactions/deposit`   | Realiza um depósito na conta.           | Privado  |
| `POST` | `/api/transactions/withdrawal`| Realiza um saque da conta.              | Privado  |
| `POST` | `/api/transactions/transfer`  | Transfere fundos para outro usuário.    | Privado  |
| `GET`  | `/api/transactions/my-history`| Busca histórico de transações.          | Privado  |