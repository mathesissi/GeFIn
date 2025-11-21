import { Lancamento, Partida } from "../model/Lancamento";
// 1. CORREÇÃO: Importe 'db' aqui
import { executarComandoSQL, db } from "../database/MySql";

export class LancamentosRepository {
  private static instance: LancamentosRepository;

  private constructor() { }

  public static getInstance(): LancamentosRepository {
    if (!LancamentosRepository.instance) {
      LancamentosRepository.instance = new LancamentosRepository();
    }
    return LancamentosRepository.instance;
  }

  private rowToLancamento(row: any, partidas: Partida[] = []): Lancamento {
    const data = row.data instanceof Date ? row.data : new Date(row.data);
    return new Lancamento(
      row.id_transacao,
      data,
      row.descricao,
      parseFloat(row.valor_total),
      partidas,
      row.id_empresa
    );
  }

  private async fetchPartidas(id_transacao: number, id_empresa: number): Promise<Partida[]> {
    const sqlPartidas = `
        SELECT id_conta, tipo_partida, valor
        FROM partidas_lancamento
        WHERE id_transacao = ? AND id_empresa = ?;
    `;
    const resultPartidas = await executarComandoSQL(sqlPartidas, [id_transacao, id_empresa]);

    return resultPartidas.map((r: any) => ({
      id_conta: r.id_conta,
      tipo_partida: r.tipo_partida,
      valor: parseFloat(r.valor),
    }));
  }

  public async Create(lancamento: Lancamento): Promise<Lancamento> {
    try {
      const sqlTransacao = `
        INSERT INTO transacoes (data, descricao, valor_total, id_empresa)
        VALUES (?, ?, ?, ?);
      `;
      const paramsTransacao = [
        lancamento.data,
        lancamento.descricao,
        lancamento.valor_total,
        lancamento.id_empresa,
      ];

      const resultTransacao = await executarComandoSQL(sqlTransacao, paramsTransacao);
      const newId = resultTransacao.insertId;

      const sqlPartida = `
        INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor, id_empresa)
        VALUES ?;
      `;
      const paramsPartidas = lancamento.partidas.map(p => [
        newId,
        p.id_conta,
        p.tipo_partida,
        p.valor,
        lancamento.id_empresa,
      ]);

      if (paramsPartidas.length > 0) {
        // 2. CORREÇÃO: Usar db.query para inserção em lote
        // O 'executarComandoSQL' usa 'execute', que não suporta o placeholder '?' para arrays aninhados
        await db.query(sqlPartida, [paramsPartidas]);
      }

      const createdLancamento = await this.Select(newId, lancamento.id_empresa);
      if (!createdLancamento) {
        throw new Error("Erro ao criar lançamento.");
      }
      return createdLancamento;
    } catch (error) {
      throw error;
    }
  }

  // ... Os outros métodos (Select, findAll, Update, Delete...) continuam iguais ...

  public async Select(id: number, id_empresa: number): Promise<Lancamento | null> {
    const sqlTransacao = "SELECT * FROM transacoes WHERE id_transacao = ? AND id_empresa = ?;";
    const resultTransacao = await executarComandoSQL(sqlTransacao, [id, id_empresa]);

    if (resultTransacao.length > 0) {
      const transacaoRow = resultTransacao[0];
      const partidasFormatadas = await this.fetchPartidas(id, id_empresa);
      return this.rowToLancamento(transacaoRow, partidasFormatadas);
    }
    return null;
  }

  public async findAll(id_empresa: number): Promise<Lancamento[]> {
    const sql = "SELECT * FROM transacoes WHERE id_empresa = ? ORDER BY data DESC, id_transacao DESC;";
    const result = await executarComandoSQL(sql, [id_empresa]);

    const lancamentos: (Lancamento | null)[] = await Promise.all(
      result.map((row: any) => this.Select(row.id_transacao, id_empresa))
    );
    return lancamentos.filter((l): l is Lancamento => l !== null);
  }

  public async Update(lancamento: Lancamento): Promise<Lancamento | null> {
    try {
      const sqlUpdateTransacao = `
            UPDATE transacoes
            SET data = ?, descricao = ?, valor_total = ?
            WHERE id_transacao = ? AND id_empresa = ?;
        `;
      const paramsUpdateTransacao = [
        lancamento.data,
        lancamento.descricao,
        lancamento.valor_total,
        lancamento.id_lancamento,
        lancamento.id_empresa,
      ];
      await executarComandoSQL(sqlUpdateTransacao, paramsUpdateTransacao);

      const sqlDeletePartidas = "DELETE FROM partidas_lancamento WHERE id_transacao = ? AND id_empresa = ?;";
      await executarComandoSQL(sqlDeletePartidas, [lancamento.id_lancamento, lancamento.id_empresa]);

      const sqlInsertPartida = `
            INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor, id_empresa)
            VALUES ?;
        `;
      const paramsInsertPartidas = lancamento.partidas.map(p => [
        lancamento.id_lancamento,
        p.id_conta,
        p.tipo_partida,
        p.valor,
        lancamento.id_empresa,
      ]);
      if (paramsInsertPartidas.length > 0) {
        // CORREÇÃO TAMBÉM NO UPDATE: Usar db.query aqui também!
        await db.query(sqlInsertPartida, [paramsInsertPartidas]);
      }

      return this.Select(lancamento.id_lancamento, lancamento.id_empresa);
    } catch (error) {
      throw error;
    }
  }

  public async Delete(id: number, id_empresa: number): Promise<boolean> {
    const sql = "DELETE FROM transacoes WHERE id_transacao = ? AND id_empresa = ?;";
    const result = await executarComandoSQL(sql, [id, id_empresa]);
    return result.affectedRows > 0;
  }

  public async findLinkedLancamentos(id_conta: number, id_empresa: number): Promise<any[]> {
    const sql = `
        SELECT t.id_transacao, t.descricao, t.valor_total as valor, t.data
        FROM transacoes t
        INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
        WHERE p.id_conta = ? AND t.id_empresa = ?
        GROUP BY t.id_transacao, t.descricao, t.valor_total, t.data
        ORDER BY t.data DESC, t.id_transacao DESC;
    `;
    const params = [id_conta, id_empresa];
    const result = await executarComandoSQL(sql, params);

    return result.map((row: any) => ({
      id_lancamento: row.id_transacao,
      descricao: row.descricao,
      valor: parseFloat(row.valor),
      data: row.data,
    }));
  }
}