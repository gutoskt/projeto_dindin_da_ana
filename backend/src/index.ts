import express from 'express';
import cors from 'cors';
import dindinRoutes from './routes/dindin.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registra as rotas da API sob o prefixo /api
app.use('/api', dindinRoutes);

// Inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor TypeScript rodando na porta ${PORT}`);
});