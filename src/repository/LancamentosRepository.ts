import { Lancamento, Partida } from "../model/Lancamento";
import { executarComandoSQL } from "../database/MySql";


export class LancamentosRepository {
  private static instance: LancamentosRepository;

  private constructor() {
    this.createTables();
  }


  private async createTables(): Promise<void> {
    const sqlTransacoes = `
      CREATE TABLE IF NOT EXISTS transacoes (
        id_transacao INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor_total DECIMAL(12, 2) NOT NULL,
        id_balancete INT
      );
    `;
    const sqlPartidas = `
      CREATE TABLE IF NOT EXISTS partidas_lancamento (
        id_partida INT AUTO_INCREMENT PRIMARY KEY,
        id_transacao INT NOT NULL,
        id_conta INT NOT NULL,
        tipo_partida VARCHAR(7) NOT NULL CHECK (tipo_partida IN ('debito', 'credito')),
        valor DECIMAL(12, 2) NOT NULL,
        id_empresa INT NOT NULL,
        FOREIGN KEY (id_transacao) REFERENCES transacoes(id_transacao) ON DELETE CASCADE,
        FOREIGN KEY (id_conta) REFERENCES contas(id_conta)
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
      );
    `;
    try {
      await executarComandoSQL(sqlTransacoes, []);
      await executarComandoSQL(sqlPartidas, []);
    } catch (error) {
    }
  }

  public static getInstance(): LancamentosRepository {
    if (!LancamentosRepository.instance) {
      LancamentosRepository.instance = new LancamentosRepository();
    }
    return LancamentosRepository.instance;
  }


  private rowToLancamento(row: any, partidas: Partida[] = []): Lancamento {
    const data = row.data instanceof Date ? row.data : new Date(row.data);
    if (isNaN(data.getTime())) {
      throw new Error("Formato de data inválido no banco de dados.");
    }
    return new Lancamento(
      row.id_transacao,
      data,
      row.descricao,
      parseFloat(row.valor_total),
      partidas
    );
  }


  private async fetchPartidas(id_transacao: number): Promise<Partida[]> {
    const sqlPartidas = `
        SELECT id_conta, tipo_partida, valor
        FROM partidas_lancamento
        WHERE id_transacao = ?;
    `;
    const resultPartidas = await executarComandoSQL(sqlPartidas, [id_transacao]);

    return resultPartidas.map((r: any) => ({
      id_conta: r.id_conta,
      tipo_partida: r.tipo_partida,
      valor: parseFloat(r.valor),
    }));
  }

  public async Create(lancamento: Lancamento): Promise<Lancamento> {
    try {
      const sqlTransacao = `
        INSERT INTO transacoes (data, descricao, valor_total)
        VALUES (?, ?, ?);
      `;
      const paramsTransacao = [
        lancamento.data,
        lancamento.descricao,
        lancamento.valor_total,
      ];

      const resultTransacao = await executarComandoSQL(sqlTransacao, paramsTransacao);
      const newId = resultTransacao.insertId;

      const sqlPartida = `
        INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor)
        VALUES ?;
      `;
      const paramsPartidas = lancamento.partidas.map(p => [
        newId,
        p.id_conta,
        p.tipo_partida,
        p.valor,
      ]);

      if (paramsPartidas.length > 0) {
        await executarComandoSQL(sqlPartida, [paramsPartidas]);
      }

      const createdLancamento = await this.Select(newId);
      if (!createdLancamento) {
        throw new Error("Erro ao criar lançamento.");
      }
      return createdLancamento;
    } catch (error) {
      throw error;
    }
  }

  public async Select(id: number): Promise<Lancamento | null> {
    const sqlTransacao = "SELECT * FROM transacoes WHERE id_transacao = ?;";
    const resultTransacao = await executarComandoSQL(sqlTransacao, [id]);

    if (resultTransacao.length > 0) {
      const transacaoRow = resultTransacao[0];
      const partidasFormatadas = await this.fetchPartidas(id);
      return this.rowToLancamento(transacaoRow, partidasFormatadas);
    }
    return null;
  }

  public async findAll(): Promise<Lancamento[]> {
    const sql = "SELECT * FROM transacoes ORDER BY data DESC, id_transacao DESC;";
    const result = await executarComandoSQL(sql, []);
    return result.map((row: any) => this.rowToLancamento(row));
  }

  public async Update(lancamento: Lancamento): Promise<Lancamento | null> {
    try {
      const sqlUpdateTransacao = `
            UPDATE transacoes
            SET data = ?, descricao = ?, valor_total = ?
            WHERE id_transacao = ?;
        `;
      const paramsUpdateTransacao = [
        lancamento.data,
        lancamento.descricao,
        lancamento.valor_total,
        lancamento.id_lancamento,
      ];
      await executarComandoSQL(sqlUpdateTransacao, paramsUpdateTransacao);

      const sqlDeletePartidas = "DELETE FROM partidas_lancamento WHERE id_transacao = ?;";
      await executarComandoSQL(sqlDeletePartidas, [lancamento.id_lancamento]);

      const sqlInsertPartida = `
            INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor)
            VALUES ?;
        `;
      const paramsInsertPartidas = lancamento.partidas.map(p => [
        lancamento.id_lancamento,
        p.id_conta,
        p.tipo_partida,
        p.valor,
      ]);
      if (paramsInsertPartidas.length > 0) {
        await executarComandoSQL(sqlInsertPartida, [paramsInsertPartidas]);
      }

      return this.Select(lancamento.id_lancamento);
    } catch (error) {
      throw error;
    }
  }

  public async Delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM transacoes WHERE id_transacao = ?;";
    const result = await executarComandoSQL(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Busca transações completas (cabeçalho + partidas) que envolvam a conta no período.
   * @param id_conta O ID da conta.
   * @param mes O mês.
   * @param ano O ano.
   * @returns Uma lista de objetos Lancamento completos.
   */
  public async findByContaAndPeriodo(id_conta: number, mes: number, ano: number): Promise<Lancamento[]> {
    const sqlTransacaoIds = `
      SELECT DISTINCT t.id_transacao
      FROM transacoes t
      INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
      WHERE p.id_conta = ?
      AND MONTH(t.data) = ?
      AND YEAR(t.data) = ?;
    `;
    const params = [id_conta, mes, ano];
    const result = await executarComandoSQL(sqlTransacaoIds, params);

    const transacaoIds: number[] = result.map((row: any) => row.id_transacao);

    const lancamentos: (Lancamento | null)[] = await Promise.all(transacaoIds.map(id => this.Select(id)));

    return lancamentos.filter((l): l is Lancamento => l !== null);
  }

  public async findLinkedLancamentos(id_conta: number): Promise<any[]> {
    const sql = `
        SELECT t.id_transacao, t.descricao, t.valor_total as valor, t.data
        FROM transacoes t
        INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
        WHERE p.id_conta = ?
        GROUP BY t.id_transacao, t.descricao, t.valor_total, t.data
        ORDER BY t.data DESC, t.id_transacao DESC;
    `;
    const params = [id_conta];
    const result = await executarComandoSQL(sql, params);

    return result.map((row: any) => ({
      id_lancamento: row.id_transacao,
      descricao: row.descricao,
      valor: parseFloat(row.valor),
      data: row.data,
    }));
  }
}