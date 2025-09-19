// src/repository/BalanceteRepository.ts

import { Balancete } from "../model/balancete";
import { executarComandoSQL } from "../database/MySql";

/**
 * Repositório para gerenciar a persistência de objetos Balancete no banco de dados.
 */
export class BalanceteRepository {
  private rowToBalancete(row: any): Balancete {
    return new Balancete(
      Number(row.id_balancete),
      row.mes,
      row.ano,
      row.id_conta,
      parseFloat(row.saldo_inicial),
      parseFloat(row.saldo_final)
    );
  }

  async create(balancete: Balancete): Promise<Balancete> {
    const query = `
      INSERT INTO balancetes_por_conta (mes, ano, id_conta, saldo_inicial, saldo_final)
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
        throw new Error("Não foi possível encontrar o balancete recém-criado.");
    }
    return createdBalancete;
  }

  async findById(id_balancete: number): Promise<Balancete | null> {
    const query = `SELECT * FROM balancetes_por_conta WHERE id_balancete = ?;`;
    const result = await executarComandoSQL(query, [id_balancete]);
    if (result.length > 0) {
      return this.rowToBalancete(result[0]);
    }
    return null;
  }

  async findAll(): Promise<Balancete[]> {
    const query = `SELECT * FROM balancetes_por_conta ORDER BY ano, mes, id_conta;`;
    const result = await executarComandoSQL(query);
    return result.map(this.rowToBalancete);
  }

  async findByMesEAno(mes: number, ano: number): Promise<Balancete[]> {
    const query = `SELECT * FROM balancetes_por_conta WHERE mes = ? AND ano = ? ORDER BY id_conta;`;
    const result = await executarComandoSQL(query, [mes, ano]);
    return result.map(this.rowToBalancete);
  }

  /**
   * Encontra um único balancete para uma conta específica em um dado período.
   */
  async findByMesEAnoAndConta(mes: number, ano: number, id_conta: number): Promise<Balancete | null> {
    const query = `SELECT * FROM balancetes_por_conta WHERE mes = ? AND ano = ? AND id_conta = ?;`;
    const result = await executarComandoSQL(query, [mes, ano, id_conta]);
    if (result.length > 0) {
      return this.rowToBalancete(result[0]);
    }
    return null;
  }

  async update(balancete: Balancete): Promise<Balancete | null> {
    const query = `
      UPDATE balancetes_por_conta
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

  async deleteById(id_balancete: string): Promise<boolean> {
    const query = `DELETE FROM balancetes_por_conta WHERE id_balancete = ?;`;
    const result = await executarComandoSQL(query, [id_balancete]);
    return result.affectedRows > 0;
  }
}