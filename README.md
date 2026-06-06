# EcoDrop ♻️🌱

**EcoDrop** é um jogo web educativo desenvolvido como projeto de trabalho acadêmico para promover a conscientização sobre reciclagem e consumo responsável, alinhado aos Objetivos de Desenvolvimento Sustentável (ODS) das Nações Unidas, especificamente a **ODS 12 - Consumo e Produção Responsável**.

---

## 📋 Sobre o Projeto

### O que é o Minigame?

O **EcoDrop** é um minigame **educativo e interativo** com temática de reciclagem. Nele, o jogador controla uma lixeira de reciclagem na tela para capturar itens que caem verticalmente. O objetivo é:

- **Capturar itens recicláveis** (papel, vidro, plástico, alumínio, papelão) para ganhar pontos
- **Evitar capturar itens não-recicláveis** (bombas)

Se o jogador capturar um item não-reciclável, o jogo termina imediatamente. Conforme a pontuação aumenta, a proporção de itens não-recicláveis também aumenta, tornando o jogo progressivamente mais desafiador.

**Objetivos educacionais:**
- Ensinar crianças e adultos quais itens são recicláveis
- Incentivar o consumo consciente e a separação correta de resíduos
- Promover gamificação da educação ambiental
- Resgatar recordes e competir com outros usuários

---

## 🌍 Alinhamento com ODS 12 - Consumo e Produção Responsável

A ODS 12 visa **garantir padrões de produção e consumo sustentáveis**. O EcoDrop contribui para esse objetivo através de:

1. **Educação Ambiental**: Ensina o público a reconhecer e separar corretamente resíduos recicláveis
2. **Conscientização**: Aumenta a conscientização sobre os impactos do consumo irresponsável
3. **Gamificação**: Torna o aprendizado sobre reciclagem divertido e envolvente
4. **Promoção de Hábitos Sustentáveis**: Incentiva a adoção de práticas responsáveis no dia a dia

---

## 👥 Equipe de Desenvolvimento

| Participante | Função |
|---|---|
| **Leonardo Sales** | Desenvolvedor |
| **Lucas Antonio Gomes** | Desenvolvedor |
| **Denner Ferreira Santos** | Desenvolvedor |
| **Gustavo Nunes Modesto** | Desenvolvedor |
| **Murilo Amorim Castro** | Desenvolvedor |

---

## 🏗️ Arquitetura do Projeto

O EcoDrop segue uma arquitetura **cliente-servidor** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              React SPA (Vite)                     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • Login & Registro (auth.jsx)                    │  │
│  │ • Home (pages/Home.jsx)                          │  │
│  │ • Minigame (pages/Game.jsx)                      │  │
│  │ • Tema Claro/Escuro (theme.jsx)                  │  │
│  │ • Efeitos Sonoros (sfx.js)                       │  │
│  │ • API HTTP Client (api.js)                       │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓ HTTP (JSON)                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   SERVER (Backend)                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Express.js REST API                    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • POST /api/auth/register  → Registrar usuário │  │
│  │ • POST /api/auth/login     → Autenticar        │  │
│  │ • GET  /api/score/me       → Obter dados user  │  │
│  │ • POST /api/score/submit   → Enviar pontuação  │  │
│  │ • GET  /api/health         → Health check      │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓ SQL                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 DATABASE (MySQL)                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Table: users                                    │  │
│  │  ├─ id (INT, PK, AUTO_INCREMENT)                │  │
│  │  ├─ email (VARCHAR, UNIQUE)                     │  │
│  │  ├─ senha (VARCHAR, hashed)                     │  │
│  │  ├─ record (INT, melhor pontuação)              │  │
│  │  └─ created_at (TIMESTAMP)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. Usuário faz login/registro no frontend
2. Backend valida credenciais e retorna JWT token
3. Frontend armazena token em localStorage
4. Todas as requisições subsequentes incluem o token
5. Backend valida token e retorna dados/submissões
6. Pontuação é salva no MySQL e comparada com o recorde anterior

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca UI com Hooks
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento cliente
- **Bootstrap 5** - Framework CSS responsivo

### **Backend**
- **Node.js** - Runtime JavaScript server-side
- **Express.js** - Framework web
- **MySQL 2 (Promise)** - Driver MySQL com async/await
- **bcryptjs** - Hash de senhas
- **jsonwebtoken (JWT)** - Autenticação stateless
- **dotenv** - Variáveis de ambiente
- **CORS** - Cross-Origin Resource Sharing

### **Banco de Dados**
- **MySQL 8.0+** - Banco de dados relacional

---

## 🚀 Como Rodar o Projeto

### **Pré-requisitos**

1. **Node.js** (v18+) e **npm** (v9+)
   - Baixar em: https://nodejs.org
   - Verificar: `node -v` e `npm -v`

2. **MySQL Server** (v8.0+)
   - Opção A: Instalar localmente
   - Opção B: Usar Docker: `docker run --name ecodrop-mysql -e MYSQL_ROOT_PASSWORD='sua senha aqui' -e MYSQL_DATABASE=ecodrop -p 3306:3306 -d mysql:8`

---

### **Passo 1: Preparar o Banco de Dados**

```powershell
# Via MySQL Client
mysql -u root -p < backend/schema.sql

# Ou se tiver senha definida
mysql -u root --password="sua senha aqui" < backend/schema.sql
```

---

### **Passo 2: Rodar o Backend**

```powershell
cd backend
npm install
npm run start
```

Esperado: `🌱 EcoDrop API ouvindo em http://localhost:4000`

---

### **Passo 3: Rodar o Frontend**

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Esperado: `➜  Local:   http://localhost:5173/`

---

### **Passo 4: Acessar a Aplicação**

Abra no navegador: `http://localhost:5173`

---

## 📦 Dependências Necessárias

### **Backend**
```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "jsonwebtoken": "^9.0.2",
  "mysql2": "^3.11.0",
  "nodemon": "^3.1.4"
}
```

### **Frontend**
```json
{
  "bootstrap": "^5.3.3",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@vitejs/plugin-react": "^4.3.1",
  "vite": "^5.4.2"
}
```

### **Sistema**
- Node.js v18+
- npm v9+
- MySQL v8.0+

---

## 🎮 Controles do Jogo

| Controle | Ação |
|---|---|
| **Setas ← →** | Mover lixeira |
| **Teclas A / D** | Mover lixeira (alternativa) |
| **Mouse** | Mover cursor para controlar a lixeira |
| **Toque (Mobile)** | Arrastar dedo na tela |

---

## 🎯 Funcionalidades Principais

✅ Autenticação com JWT e bcrypt  
✅ Minigame interativo educativo  
✅ Sistema de pontuação e recorde  
✅ Tema claro/escuro persistente  
✅ Responsividade total (desktop, tablet, mobile)  
✅ Efeitos sonoros  
✅ Interface 100% em Português Brasileiro  

---

## 📝 Endpoints da API

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Entrar na conta
- `GET /api/score/me` - Obter dados do usuário
- `POST /api/score/submit` - Enviar pontuação
- `GET /api/health` - Verificar status da API

---

## 📄 Estrutura de Pastas

```
ecodrop/
├── backend/
│   ├── db.js              # Conexão MySQL
│   ├── server.js          # Servidor Express
│   ├── schema.sql         # Schema do banco
│   └── routes/
│       ├── auth.js        # Rotas de autenticação
│       └── score.js       # Rotas de pontuação
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes React
│   │   ├── App.jsx        # Rotas principais
│   │   ├── auth.jsx       # Context de autenticação
│   │   ├── theme.jsx      # Context de tema
│   │   ├── api.js         # HTTP client
│   │   ├── sfx.js         # Efeitos sonoros
│   │   └── styles.css     # Estilos globais
│   └── index.html         # Entrada HTML
└── README.md              # Este arquivo
```

---

**EcoDrop** - Educando para um consumo responsável ♻️🌱
