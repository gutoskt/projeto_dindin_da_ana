import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Iniciação para pegar as variaveis de ambiente do arquivo .env

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect((err, _client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  }
  console.log(' Conectado ao PostgreSQL com TypeScript!');
  release();
});

export default pool;