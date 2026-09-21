# 💰 Dindim — Gestão Financeira e de Estoque Mobile

O **Dindim** é uma aplicação mobile multiplataforma desenvolvida para simplificar o controle financeiro e a gestão de estoque. O aplicativo oferece uma experiência fluida para monitoramento de vendas, controle de entradas/saídas, gerenciamento de produtos e geração de relatórios detalhados em PDF.

---

## ✨ Funcionalidades Principais

* **Gestão Financeira**: Registro e acompanhamento de entradas, saídas, receitas e despesas.
* **Controle de Estoque**: Cadastro, atualização e controle de quantidade de produtos em tempo real.
* **Geração de Relatórios**: Exportação de relatórios financeiros e de estoque no formato PDF.
* **Sincronização em Tempo Real**: Atualização instantânea dos dados entre diferentes telas do app.
* **Transações Seguras**: Garantia da integridade e consistência dos dados nas operações financeiras e de estoque.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend (Mobile)**
* **[React Native](https://reactnative.dev/)** — Framework para desenvolvimento mobile nativo cross-platform.
* **[Expo](https://expo.dev/)** — Ecossistema para facilitação do desenvolvimento e build no React Native.
* **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática para maior segurança e produtividade.

### **Backend & Banco de Dados**
* **[Node.js](https://nodejs.org/)** & **[Express](https://expressjs.com/)** — API RESTful para regras de negócio e rotas.
* **[PostgreSQL](https://www.postgresql.org/)** — Banco de dados relacional robusto para armazenamento dos dados.
* **TypeScript** — Utilizado em todo o ciclo do backend.

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**
* Node.js (versão LTS recomendada)
* Gerenciador de pacotes (`npm` ou `yarn`)
* Aplicativo **Expo Go** instalado no seu dispositivo móvel (Android ou iOS) **ou** um emulador configurado.
* Instância do **PostgreSQL** rodando.

---

### **1. Configuração do Backend**

1. Clone o repositório:
   ```bash
   git clone [https://github.com/gutoskt/projeto_dindin_da_ana.git](https://github.com/gutoskt/projeto_dindin_da_ana.git)
   cd projeto_dindin_da_ana/server # ou o caminho da pasta do backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo .env na raiz do backend baseado no arquivo .env.example:
   ```bash
   PORT=3000
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/dindim_db
   ```
4. Execute as migrações/scripts do banco de dados e inicie o servidor:
   ```bash
   npm run dev
   ```
### **2. Configuração do Frontend (App Mobile)**

1. Acesse a pasta do projeto mobile:
   ```bash
   cd ../mobile
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo .env para apontar para a URL da API backend:
   ```bash
   API_URL=http://SEU_IP_LOCAL:3000
   ```
4. Inicie o Expo:
   ```bash
   npx expo start
   ```
5. Abra o aplicativo Expo Go no celular e leia o QR Code exibido no terminal (ou rode no emulador).
📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
Desenvolvido por Augusto / gutoskt (https://github.com/gutoskt) 🚀
