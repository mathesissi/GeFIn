import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { RegisterRoutes } from './route/routes';
import mysql from 'mysql2/promise';
import 'reflect-metadata';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/web', express.static(path.join(__dirname, '../web')));

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gefin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

RegisterRoutes(app);

// ================= BALANCETE =================
app.get('/balancete', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);
    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ message: 'Mês ou ano inválido' });
    }

    const [rows] = await db.query<any[]>(
      `SELECT c.id_conta, c.codigo_conta, c.nome_conta,
        SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE 0 END) AS total_debito,
        SUM(CASE WHEN p.tipo_partida = 'credito' THEN p.valor ELSE 0 END) AS total_credito
       FROM contas c
       LEFT JOIN partidas_lancamento p ON c.id_conta = p.id_conta
       LEFT JOIN transacoes t ON p.id_transacao = t.id_transacao
       WHERE MONTH(t.data) = ? AND YEAR(t.data) = ?
       GROUP BY c.id_conta
       ORDER BY c.codigo_conta`,
      [mes, ano]
    );

    const contas: any[] = [];
    for (const r of rows) {
      const contaId = r.id_conta;

      const [prev] = await db.query<any[]>(
        `SELECT saldo_final FROM balancetes WHERE id_conta = ? AND mes = ? AND ano = ?`,
        [contaId, mes === 1 ? 12 : mes - 1, mes === 1 ? ano - 1 : ano]
      );

      const saldoInicial = prev.length > 0 ? Number(prev[0].saldo_final) : 0;
      const movimentoDebito = Number(r.total_debito || 0);
      const movimentoCredito = Number(r.total_credito || 0);
      const saldoFinal = saldoInicial + movimentoDebito - movimentoCredito;

      contas.push({
        codigo_conta: r.codigo_conta,
        nome_conta: r.nome_conta,
        total_debito: movimentoDebito,
        total_credito: movimentoCredito,
        saldo_inicial: saldoInicial,
        saldo_final: saldoFinal,
      });

      await db.query(
        `INSERT INTO balancetes (id_conta, mes, ano, saldo_inicial, movimento_debito, movimento_credito, saldo_final)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           saldo_inicial = VALUES(saldo_inicial),
           movimento_debito = VALUES(movimento_debito),
           movimento_credito = VALUES(movimento_credito),
           saldo_final = VALUES(saldo_final),
           updated_at = CURRENT_TIMESTAMP`,
        [contaId, mes, ano, saldoInicial, movimentoDebito, movimentoCredito, saldoFinal]
      );
    }

    const total_debitos = contas.reduce((acc, r) => acc + r.total_debito, 0);
    const total_creditos = contas.reduce((acc, r) => acc + r.total_credito, 0);

    return res.json({ contas, total_debitos, total_creditos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar balancete' });
  }
});

// ================= BALANÇO =================
app.get('/balanco', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);
    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ message: 'Mês ou ano inválido' });
    }

    const [rows] = await db.query<any[]>(
      `SELECT c.tipo_conta, c.codigo_conta, c.nome_conta,
              b.saldo_inicial, b.saldo_final
       FROM contas c 
       LEFT JOIN balancetes b ON c.id_conta = b.id_conta AND b.mes = ? AND b.ano = ?
       ORDER BY FIELD(c.tipo_conta, 'Ativo', 'Passivo', 'PatrimonioLiquido', 'Receita', 'Despesa'), c.codigo_conta`,
      [mes, ano]
    );

    const balanco: Record<string, any[]> = {
      Ativo: [],
      Passivo: [],
      PatrimonioLiquido: [],
      Receita: [],
      Despesa: [],
    };

    rows.forEach(r => {
      if (!balanco[r.tipo_conta]) balanco[r.tipo_conta] = [];
      balanco[r.tipo_conta].push({
        codigo_conta: r.codigo_conta,
        nome_conta: r.nome_conta,
        saldo_inicial: r.saldo_inicial || 0,
        saldo_final: r.saldo_final || 0,
      });
    });

    return res.json({ balanco });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar balanço patrimonial' });
  }
});

// ================= LIVRO DIÁRIO =================
app.get('/livrodiario', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);

    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ message: 'Mês ou ano inválido' });
    }

    const [rows] = await db.query<any[]>(
      `SELECT 
        t.id_transacao,
        DATE_FORMAT(t.data, '%Y-%m-%d') AS data,
        t.descricao,
        SUM(p.valor) AS valor_total
       FROM transacoes t
       JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
       WHERE MONTH(t.data) = ? AND YEAR(t.data) = ?
       GROUP BY t.id_transacao
       ORDER BY t.data ASC, t.id_transacao ASC`,
      [mes, ano]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar Livro Diário:', error);
    return res.status(500).json({ message: 'Erro ao gerar Livro Diário' });
  }
});

// ================= LIVRO DIÁRIO - DETALHES =================
app.get('/livrodiario/:id/detalhes', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const [rows] = await db.query<any[]>(
      `SELECT 
          p.id_partida,
          c.nome_conta AS conta,
          p.tipo_partida,
          c.tipo_conta,
          c.subtipo_conta,
          c.subtipo_secundario,
          p.valor
       FROM partidas_lancamento p
       JOIN contas c ON p.id_conta = c.id_conta
       WHERE p.id_transacao = ?
       ORDER BY p.tipo_partida DESC, c.nome_conta ASC`,
      [id]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Erro ao obter detalhes do lançamento:', error);
    return res.status(500).json({ message: 'Erro ao buscar detalhes do lançamento' });
  }
});

// ================= ERRO 404 =================
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
