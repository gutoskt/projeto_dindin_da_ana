import type { Request, Response } from 'express';
import pool from '../db';

// --- Tipos & Interfaces ---
export interface DindinRow {
  id: number;
  nomedindin: string;
  quantidadesabor: number;
}

interface UserParams {
  id: string;
}

interface CadastrarSaborBody {
  nomedindin: string;
  quantidadesabor: number;
}

interface PatchQuantidadeBody {
  quantidadesabor?: number;
}

interface MovimentacaoBody {
  entradas?: number;
  saidas?: number;
}

const CUSTO_UNITARIO = 1.00;
const PRECO_VENDA = 2.00;

export const cadastrarSabor = async (
  req: Request, 
  res: Response
) => {
  try {
    const { nomedindin, quantidadesabor } = req.body as CadastrarSaborBody;

    if (!nomedindin?.trim() || typeof quantidadesabor !== 'number' || quantidadesabor < 0) {
      return res.status(400).json({ mensagem: 'Envie um nome válido e uma quantidade maior ou igual a zero.' });
    }

    const queryText = `
      INSERT INTO dindin (nomedindin, quantidadesabor) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    
    const result = await pool.query<DindinRow>(queryText, [nomedindin.trim(), quantidadesabor]);
    return res.status(201).json({ mensagem: 'Sabor cadastrado com sucesso!', dindin: result.rows[0] });
  } catch (error) {
    console.error('Erro ao cadastrar novo sabor:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao salvar no banco de dados.' });
  }
};

export const apagarSabor = async (req: Request<UserParams>, res: Response) => {
  try {
    const numId = Number(req.params.id);
    if (isNaN(numId)) return res.status(400).json({ mensagem: 'ID inválido.' });

    const queryText = 'DELETE FROM dindin WHERE id = $1 RETURNING *;';
    const result = await pool.query<DindinRow>(queryText, [numId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Dindin não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Sabor apagado com sucesso!', apagado: result.rows[0] });
  } catch (error) {
    console.error('Erro ao apagar dindin:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao apagar no banco de dados.' });
  }
};

export const calcularTotalSabor = async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT 
        COALESCE(SUM(entradas), 0)::INTEGER AS total_entradas_mes,
        COALESCE(SUM(saidas), 0)::INTEGER AS total_saida_mes
      FROM dindin_mes
      WHERE mes_ano = DATE_TRUNC('month', CURRENT_DATE);
    `;

    const result = await pool.query(queryText);
    const entrada = Number(result.rows[0].total_entradas_mes);
    const saida = Number(result.rows[0].total_saida_mes);

    const custototalMes = entrada * CUSTO_UNITARIO;
    const faturamentoMes = saida * PRECO_VENDA;
    const lucroMes = faturamentoMes - custototalMes;

    return res.status(200).json({ 
      totalMes: entrada, 
      custoMes: custototalMes, 
      lucroMes: lucroMes, 
      faturamentoMes: faturamentoMes 
    });
  } catch (error) {
    console.error('Erro ao calcular total:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao calcular totais.' });
  }
};

export const listarSabores = async (_req: Request, res: Response) => {
  try {
    const queryText = 'SELECT * FROM dindin ORDER BY id ASC;';
    const result = await pool.query<DindinRow>(queryText);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar sabores:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao buscar sabores no banco de dados.' });
  }
};

export const editarSabor = async (
  req: Request<UserParams, any, CadastrarSaborBody>, 
  res: Response
) => {
  const numId = Number(req.params.id);
  const { nomedindin, quantidadesabor } = req.body;

  if (isNaN(numId)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (!nomedindin?.trim() || typeof quantidadesabor !== 'number' || quantidadesabor < 0) {
    return res.status(400).json({ mensagem: 'Nome e quantidade são obrigatórios.' });
  }

  try {
    const queryText = `
      UPDATE dindin
      SET nomedindin = $1, quantidadesabor = $2
      WHERE id = $3
      RETURNING id, nomedindin, quantidadesabor;
    `;

    const result = await pool.query<DindinRow>(queryText, [nomedindin.trim(), quantidadesabor, numId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Sabor não encontrado.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro na query PUT:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const editarQuantidade = async (
  req: Request<UserParams, any, PatchQuantidadeBody>, 
  res: Response
) => {
  const numId = Number(req.params.id);
  const { quantidadesabor } = req.body;

  if (isNaN(numId)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (typeof quantidadesabor !== 'number' || quantidadesabor < 0) {
    return res.status(400).json({ mensagem: 'A quantidade deve ser um número maior ou igual a zero.' });
  }

  try {
    const queryText = `
      UPDATE dindin
      SET quantidadesabor = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query<DindinRow>(queryText, [quantidadesabor, numId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Sabor não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro na rota PATCH:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const adicionarEntrada = async (
  req: Request<UserParams, any, MovimentacaoBody>, 
  res: Response
) => {
  const numId = Number(req.params.id);
  const { entradas } = req.body;

  if (isNaN(numId)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (typeof entradas !== 'number' || entradas <= 0) {
    return res.status(400).json({ mensagem: 'Envie uma quantidade de entradas válida (número maior que zero).' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const queryEstoque = `
      UPDATE dindin
      SET quantidadesabor = quantidadesabor + $1
      WHERE id = $2
      RETURNING *;
    `;
    const estoqueResult = await client.query<DindinRow>(queryEstoque, [entradas, numId]);

    if (estoqueResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Sabor de dindin não encontrado.' });
    }

    const queryHistorico = `
      INSERT INTO dindin_mes (dindin_id, entradas, saidas, mes_ano)
      VALUES ($1, $2, 0, DATE_TRUNC('month', CURRENT_DATE))
      ON CONFLICT (dindin_id, mes_ano) 
      DO UPDATE SET entradas = dindin_mes.entradas + EXCLUDED.entradas
      RETURNING *;
    `;
    const historicoResult = await client.query(queryHistorico, [numId, entradas]);

    await client.query('COMMIT');

    return res.status(200).json({
      mensagem: 'Entrada registrada e estoque atualizado com sucesso!',
      historico: historicoResult.rows[0],
      dindinAtualizado: estoqueResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar entrada:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  } finally {
    client.release();
  }
};

export const adicionarSaida = async (
  req: Request<UserParams, any, MovimentacaoBody>, 
  res: Response
) => {
  const numId = Number(req.params.id);
  const { saidas } = req.body;

  if (isNaN(numId)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (typeof saidas !== 'number' || saidas <= 0) {
    return res.status(400).json({ mensagem: 'Envie uma quantidade de saídas válida (número maior que zero).' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateEstoqueQuery = `
      UPDATE dindin
      SET quantidadesabor = quantidadesabor - $1
      WHERE id = $2 AND quantidadesabor >= $1
      RETURNING *;
    `;
    const estoqueAtualizado = await client.query<DindinRow>(updateEstoqueQuery, [saidas, numId]);

    if (estoqueAtualizado.rowCount === 0) {
      const checkExists = await client.query<{ quantidadesabor: number }>(
        'SELECT quantidadesabor FROM dindin WHERE id = $1', 
        [numId]
      );
      await client.query('ROLLBACK');

      if (checkExists.rowCount === 0) {
        return res.status(404).json({ mensagem: 'Sabor de dindin não encontrado.' });
      }

      return res.status(400).json({ 
        mensagem: `Estoque insuficiente. Quantidade disponível: ${checkExists.rows[0].quantidadesabor}` 
      });
    }

    const updateHistoricoQuery = `
      INSERT INTO dindin_mes (dindin_id, entradas, saidas, mes_ano)
      VALUES ($1, 0, $2, DATE_TRUNC('month', CURRENT_DATE))
      ON CONFLICT (dindin_id, mes_ano) 
      DO UPDATE SET saidas = dindin_mes.saidas + EXCLUDED.saidas
      RETURNING *;
    `;
    const historicoAtualizado = await client.query(updateHistoricoQuery, [numId, saidas]);

    await client.query('COMMIT');

    return res.status(200).json({
      mensagem: 'Saída registrada com sucesso!',
      dindinAtualizado: estoqueAtualizado.rows[0],
      historico: historicoAtualizado.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar saída:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  } finally {
    client.release();
  }
};

export const listarHistoricoPorMes = async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT 
        TO_CHAR(dm.mes_ano, 'YYYY-MM-DD') AS mes_ano,
        SUM(dm.entradas)::INTEGER AS total_entradas_mes,
        SUM(dm.saidas)::INTEGER AS total_saidas_mes,
        (SUM(dm.entradas) * $1)::NUMERIC(10,2) AS custo_mes,
        (SUM(dm.saidas) * $2)::NUMERIC(10,2) AS faturamento_mes,
        ((SUM(dm.saidas) * $2) - (SUM(dm.entradas) * $1))::NUMERIC(10,2) AS lucro_mes,
        COALESCE(
          json_agg(
            json_build_object(
              'dindin_id', d.id,
              'nomedindin', d.nomedindin,
              'entradas', dm.entradas,
              'saidas', dm.saidas
            )
          ), 
          '[]'::json
        ) AS sabores
      FROM dindin_mes dm
      INNER JOIN dindin d ON d.id = dm.dindin_id
      GROUP BY dm.mes_ano
      ORDER BY dm.mes_ano DESC;
    `;

    const result = await pool.query(queryText, [CUSTO_UNITARIO, PRECO_VENDA]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico mensal:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};