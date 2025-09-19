import { Conta, TipoConta } from "../model/Contas";
import { executarComandoSQL } from "../database/MySql";
export class ContaRepository {
 
  private rowToConta(row: any): Conta {
    return new Conta(
      row.id_conta,
      row.nome_conta,
      row.tipo_conta as TipoConta,
      row.codigo_conta,
      row.subtipo_conta || undefined
    );
  }

  /**
   * Cria uma nova conta no banco de dados.
   * @param conta Objeto Conta a ser inserido.
   * @returns A conta criada com ID preenchido.
   */
  async create(conta: Conta): Promise<Conta> {
    const sql = `
      INSERT INTO Conta (nome_conta, tipo_conta, subtipo_conta, codigo_conta)
      VALUES (?, ?, ?, ?);
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.codigo_conta,
    ];
    const result = await executarComandoSQL(sql, params);
    const newId = result.insertId;

    const created = await this.findById(newId);
    if (!created) throw new Error("Erro ao criar conta");
    return created;
  }

  async findById(id: number): Promise<Conta | null> {
    const sql = "SELECT * FROM Conta WHERE id_conta = ?;";
    const result = await executarComandoSQL(sql, [id]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }

  async findAll(): Promise<Conta[]> {
    const sql = "SELECT * FROM Conta ORDER BY codigo_conta;";
    const result = await executarComandoSQL(sql, []);
    return result.map((row: any) => this.rowToConta(row));
  }

  async update(conta: Conta): Promise<Conta | null> {
    const sql = `
      UPDATE Conta
      SET nome_conta = ?, tipo_conta = ?, subtipo_conta = ?, codigo_conta = ?
      WHERE id_conta = ?;
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.codigo_conta,
      conta.id_conta,
    ];
    await executarComandoSQL(sql, params);

    return this.findById(conta.id_conta);
  }

  async deleteById(id: number): Promise<boolean> {
    const sql = "DELETE FROM Conta WHERE id_conta = ?;";
    const result = await executarComandoSQL(sql, [id]);
    return result.affectedRows > 0;
  }

  async findByCodigo(codigo: string): Promise<Conta | null> {
    const sql = "SELECT * FROM Conta WHERE codigo_conta = ?;";
    const result = await executarComandoSQL(sql, [codigo]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }
}
