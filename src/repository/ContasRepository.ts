import { Conta, TipoConta } from "../model/Contas";
import { executarComandoSQL } from "../database/MySql";

export class ContaRepository {
  private static instance: ContaRepository;

  private constructor() { }

  public static getInstance(): ContaRepository {
    if (!ContaRepository.instance) {
      ContaRepository.instance = new ContaRepository();
    }
    return ContaRepository.instance;
  }

  private rowToConta(row: any): Conta {
    return new Conta(
      row.id_conta,
      row.nome_conta,
      row.tipo_conta as TipoConta,
      row.codigo_conta,
      row.id_empresa,
      row.subtipo_conta || undefined,
      row.subtipo_secundario || undefined
    );
  }

  async create(conta: Conta): Promise<Conta> {
    // CORREÇÃO: Adicionado id_empresa na lista de colunas e o '?' correspondente
    const sql = `
      INSERT INTO contas (nome_conta, tipo_conta, subtipo_conta, subtipo_secundario, codigo_conta, id_empresa)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.subtipo_secundario || null,
      conta.codigo_conta,
      conta.id_empresa,
    ];

    const result = await executarComandoSQL(sql, params);
    const newId = result.insertId;

    const created = await this.findById(newId, conta.id_empresa);
    if (!created) throw new Error("Erro ao criar conta");
    return created;
  }

  async findById(id: number, id_empresa: number): Promise<Conta | null> {
    const sql = "SELECT * FROM contas WHERE id_conta = ? AND id_empresa = ?;";
    const result = await executarComandoSQL(sql, [id, id_empresa]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }

  // CORREÇÃO: Adicionado id_empresa para verificar duplicidade apenas dentro da mesma empresa
  async findByCodigoConta(codigoConta: string, id_empresa: number): Promise<Conta | null> {
    const sql = "SELECT * FROM contas WHERE codigo_conta = ? AND id_empresa = ?;";
    const result = await executarComandoSQL(sql, [codigoConta, id_empresa]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }

  async findAll(id_empresa: number): Promise<Conta[]> {
    const sql = "SELECT * FROM contas WHERE id_empresa = ? ORDER BY codigo_conta;";
    const result = await executarComandoSQL(sql, [id_empresa]);
    return result.map((row: any) => this.rowToConta(row));
  }

  async update(conta: Conta): Promise<Conta | null> {
    const sql = `
      UPDATE contas
      SET nome_conta = ?, tipo_conta = ?, subtipo_conta = ?, subtipo_secundario = ?, codigo_conta = ?
      WHERE id_conta = ? AND id_empresa = ?;
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.subtipo_secundario || null,
      conta.codigo_conta,
      conta.id_conta,
      conta.id_empresa
    ];
    await executarComandoSQL(sql, params);
    return this.findById(conta.id_conta, conta.id_empresa);
  }

  async delete(id: number, id_empresa: number): Promise<boolean> {
    const sql = "DELETE FROM contas WHERE id_conta = ? AND id_empresa = ?;";
    const result = await executarComandoSQL(sql, [id, id_empresa]);
    return result.affectedRows > 0;
  }
}