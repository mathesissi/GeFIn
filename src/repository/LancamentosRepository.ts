import { Lancamento } from "../model/Lancamento";
import { executarComandoSQL } from "../database/MySql"; 

// Interface que reflete a estrutura exata da tabela 'lancamentos' no banco de dados
// As chaves primárias e estrangeiras são numéricas, não strings
export interface LancamentoDbRow {
  id_lancamento: number;
  data: Date;
  descricao: string;
  valor: number;
  id_conta_debito: number;
  id_conta_credito: number;
}

export class LancamentosRepository {
  /**
   * Create: Salva um novo lançamento no banco de dados.
   * @param lancamento O objeto Lancamento a ser salvo.
   * @returns O lançamento salvo com o ID gerado pelo banco.
   */
  public async Create(lancamento: Lancamento): Promise<Lancamento> {
    const sql = `
      INSERT INTO lancamentos (data, descricao, valor, id_conta_debito, id_conta_credito)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_lancamento;
    `;
    const params = [
      lancamento.data,
      lancamento.descricao,
      lancamento.valor,
      parseInt(lancamento.id_conta_debito), 
      parseInt(lancamento.id_conta_credito),
    ];

    const result = await executarComandoSQL(sql, params);
    const newId = result.rows[0].id_lancamento;

  
    return new Lancamento(
      String(newId),
      lancamento.data,
      lancamento.descricao,
      lancamento.valor,
      lancamento.id_conta_debito,
      lancamento.id_conta_credito
    );
  }

  /**
   * Select: Busca um único lançamento por seu ID.
   * @param id O ID do lançamento a ser buscado.
   * @returns O lançamento encontrado ou 'undefined' se não existir.
   */
  public async Select(id: string): Promise<Lancamento | undefined> {
    const sql = "SELECT * FROM lancamentos WHERE id_lancamento = $1;";
    const params = [parseInt(id)]; 

    const result = await executarComandoSQL(sql, params);
    const row: LancamentoDbRow | undefined = result.rows[0];

    if (row) {
      return new Lancamento(
        String(row.id_lancamento),
        new Date(row.data),
        row.descricao,
        row.valor,
        String(row.id_conta_debito),
        String(row.id_conta_credito)
      );
    }
    return undefined;
  }

  /**
   * SelectAll: Busca todos os lançamentos no banco de dados.
   * @returns Uma lista de todos os lançamentos.
   */
  public async SelectAll(): Promise<Lancamento[]> {
    const sql = "SELECT * FROM lancamentos;";
    const result = await executarComandoSQL(sql, []);

    return result.rows.map(
      (row: LancamentoDbRow) =>
        new Lancamento(
          String(row.id_lancamento),
          new Date(row.data),
          row.descricao,
          row.valor,
          String(row.id_conta_debito),
          String(row.id_conta_credito)
        )
    );
  }

  /**
   * Update: Atualiza um lançamento existente no banco de dados.
   * @param lancamento O objeto Lancamento com os dados a serem atualizados.
   * @returns O lançamento atualizado ou 'null' se não encontrado.
   */
  public async Update(lancamento: Lancamento): Promise<Lancamento | null> {
    const sql = `
      UPDATE lancamentos
      SET data = $1, descricao = $2, valor = $3, id_conta_debito = $4, id_conta_credito = $5
      WHERE id_lancamento = $6
      RETURNING *;
    `;
    const params = [
      lancamento.data,
      lancamento.descricao,
      lancamento.valor,
      parseInt(lancamento.id_conta_debito),
      parseInt(lancamento.id_conta_credito),
      parseInt(lancamento.id_lancamento),
    ];

    const result = await executarComandoSQL(sql, params);
    if (result.rows.length > 0) {
      const updatedRow: LancamentoDbRow = result.rows[0];
      return new Lancamento(
        String(updatedRow.id_lancamento),
        updatedRow.data,
        updatedRow.descricao,
        updatedRow.valor,
        String(updatedRow.id_conta_debito),
        String(updatedRow.id_conta_credito)
      );
    }
    return null;
  }

  /**
   * Delete: Deleta um lançamento do banco de dados por seu ID.
   * @param id O ID do lançamento a ser deletado.
   * @returns 'true' se o lançamento foi deletado, 'false' caso contrário.
   */
  public async Delete(id: string): Promise<boolean> {
    const sql = "DELETE FROM lancamentos WHERE id_lancamento = $1;";
    const params = [parseInt(id)];

    const result = await executarComandoSQL(sql, params);
    // Em uma lib real, 'result.rowCount' indica o número de linhas afetadas.
    // Se for 1, significa que a linha foi deletada.
    return result.rowCount > 0;
  }
}