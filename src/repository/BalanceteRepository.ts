// src/repository/BalanceteRepository.ts
import { db } from '../database/database';
import { Balancete } from '../model/Balancete';

export class BalanceteRepository {
  private static instance: BalanceteRepository;

  private constructor() {}

  public static getInstance(): BalanceteRepository {
    if (!BalanceteRepository.instance) {
      BalanceteRepository.instance = new BalanceteRepository();
    }
    return BalanceteRepository.instance;
  }

  public async findByMesEAno(mes: number, ano: number) {
    const sql = `
      SELECT b.id_balancete, b.id_conta, c.codigo_conta, c.nome_conta,
             b.saldo_inicial, b.movimento_debito, b.movimento_credito, b.saldo_final
      FROM balancetes b
      JOIN contas c ON b.id_conta = c.id_conta
      WHERE b.mes = ? AND b.ano = ?
      ORDER BY c.codigo_conta ASC;
    `;
    const [rows] = await db.query(sql, [mes, ano]);
    return rows as any[];
  }
}
