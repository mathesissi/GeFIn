import { Conta, TipoConta } from "../model/Contas";
import { executarComandoSQL } from "../database/MySql";

export class ContaRepository {
  private static instance: ContaRepository;

  private constructor() {
    this.createTable();
  }

  public static getInstance(): ContaRepository {
    if (!ContaRepository.instance) {
      ContaRepository.instance = new ContaRepository();
    }
    return ContaRepository.instance;
  }

  private async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS contas (
        id_conta INT AUTO_INCREMENT PRIMARY KEY,
        nome_conta VARCHAR(255) NOT NULL,
        tipo_conta ENUM('Ativo', 'Passivo', 'PatrimonioLiquido', 'Receita', 'Despesa') NOT NULL,
        codigo_conta VARCHAR(255) NOT NULL UNIQUE,
        subtipo_conta VARCHAR(255),
        subtipo_secundario VARCHAR(255) 
        id_empresa INT NOT NULL,
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
        UNIQUE KEY unique_conta_empresa (codigo_conta, id_empresa)
      );
    `;
    try {
      await executarComandoSQL(sql, []);
      console.log('Tabela "contas" criada ou já existente.');
    } catch (error) {
      console.error('Erro ao criar tabela "contas":', error);
    }
  }

  private rowToConta(row: any): Conta {
    return new Conta(
      row.id_conta,
      row.nome_conta,
      row.tipo_conta as TipoConta,
      row.codigo_conta,
      row.subtipo_conta || undefined,
      row.subtipo_secundario || undefined
    );
  }

  async create(conta: Conta): Promise<Conta> {
    const sql = `
      INSERT INTO contas (nome_conta, tipo_conta, subtipo_conta, subtipo_secundario, codigo_conta)
      VALUES (?, ?, ?, ?, ?);
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.subtipo_secundario || null,
      conta.codigo_conta,
    ];
    const result = await executarComandoSQL(sql, params);
    const newId = result.insertId;

    const created = await this.findById(newId);
    if (!created) throw new Error("Erro ao criar conta");
    return created;
  }

  async findById(id: number): Promise<Conta | null> {
    const sql = "SELECT * FROM contas WHERE id_conta = ?;";
    const result = await executarComandoSQL(sql, [id]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }

  async findByCodigoConta(codigoConta: string): Promise<Conta | null> {
    const sql = "SELECT * FROM contas WHERE codigo_conta = ?;";
    const result = await executarComandoSQL(sql, [codigoConta]);
    if (result.length > 0) {
      return this.rowToConta(result[0]);
    }
    return null;
  }

  async findAll(): Promise<Conta[]> {
    const sql = "SELECT * FROM contas ORDER BY codigo_conta;";
    const result = await executarComandoSQL(sql, []);
    return result.map((row: any) => this.rowToConta(row));
  }

  async update(conta: Conta): Promise<Conta | null> {
    const sql = `
      UPDATE contas
      SET nome_conta = ?, tipo_conta = ?, subtipo_conta = ?, subtipo_secundario = ?, codigo_conta = ?
      WHERE id_conta = ?;
    `;
    const params = [
      conta.nome_conta,
      conta.tipo_conta,
      conta.subtipo_conta || null,
      conta.subtipo_secundario || null,
      conta.codigo_conta,
      conta.id_conta,
    ];
    await executarComandoSQL(sql, params);
    return this.findById(conta.id_conta);
  }

  async delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM contas WHERE id_conta = ?;";
    const result = await executarComandoSQL(sql, [id]);
    return result.affectedRows > 0;
  }
}