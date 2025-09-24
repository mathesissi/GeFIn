import { Balancete } from "../model/balancete";
import { executarComandoSQL } from "../database/MySql";

export class BalanceteRepository {
  private static instance: BalanceteRepository;

  private constructor() {
    this.createTable();
  }

  public static getInstance(): BalanceteRepository {
    if (!BalanceteRepository.instance) {
      BalanceteRepository.instance = new BalanceteRepository();
    }
    return BalanceteRepository.instance;
  }

  private async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS balancetes (
        id_balancete INT AUTO_INCREMENT PRIMARY KEY,
        mes INT NOT NULL,
        ano INT NOT NULL,
        id_conta INT NOT NULL,
        saldo_inicial DECIMAL(10, 2) NOT NULL,
        saldo_final DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
        UNIQUE KEY (mes, ano, id_conta)
      );
    `;
    try {
      await executarComandoSQL(sql, []);
      console.log('Tabela "balancetes" criada ou já existente.');
    } catch (error) {
      console.error('Erro ao criar tabela "balancetes":', error);
    }
  }

  private rowToBalancete(row: any): Balancete {
    return new Balancete(
      Number(row.id_balancete),
      row.mes,
      row.ano,
      Number(row.id_conta),
      parseFloat(row.saldo_inicial),
      parseFloat(row.saldo_final)
    );
  }

  async create(balancete: Balancete): Promise<Balancete> {
    const query = `
      INSERT INTO balancetes (mes, ano, id_conta, saldo_inicial, saldo_final)
      VALUES (?, ?, ?, ?, ?);
    `;
    const values = [
      balancete.mes,
      balancete.ano,
      balancete.id_conta,
      balancete.saldo_inicial,
      balancete.saldo_final,
    ];
    const result = await executarComandoSQL(query, values);
    const newBalanceteId = Number(result.insertId);

    const createdBalancete = await this.findById(newBalanceteId);
    if (!createdBalancete) {
      throw new Error("Erro ao criar balancete.");
    }
    return createdBalancete;
  }

  async findByMesEAno(mes: number, ano: number): Promise<Balancete[]> {
    const query = `SELECT * FROM balancetes WHERE mes = ? AND ano = ?;`;
    const result = await executarComandoSQL(query, [mes, ano]);
    return result.map(this.rowToBalancete);
  }

  async findById(id: number): Promise<Balancete | null> {
    const query = `SELECT * FROM balancetes WHERE id_balancete = ?;`;
    const result = await executarComandoSQL(query, [id]);
    if (result.length > 0) {
      return this.rowToBalancete(result[0]);
    }
    return null;
  }

  async findByMesEAnoAndConta(mes: number, ano: number, id_conta: number): Promise<Balancete | null> {
    const query = `SELECT * FROM balancetes WHERE mes = ? AND ano = ? AND id_conta = ?;`;
    const result = await executarComandoSQL(query, [mes, ano, id_conta]);
    if (result.length > 0) {
      return this.rowToBalancete(result[0]);
    }
    return null;
  }

  async update(balancete: Balancete): Promise<Balancete | null> {
    const query = `
      UPDATE balancetes
      SET mes = ?, ano = ?, id_conta = ?, saldo_inicial = ?, saldo_final = ?
      WHERE id_balancete = ?;
    `;
    const values = [
      balancete.mes,
      balancete.ano,
      balancete.id_conta,
      balancete.saldo_inicial,
      balancete.saldo_final,
      balancete.id_balancete,
    ];
    await executarComandoSQL(query, values);
    return this.findById(balancete.id_balancete);
  }
}