// src/repository/BalanceteRepository.ts
import { executarComandoSQL } from '../database/MySql';
import { Balancete } from '../model/balancete';

export class BalanceteRepository {
  private static instance: BalanceteRepository;

  private constructor() { }

  public static getInstance(): BalanceteRepository {
    if (!BalanceteRepository.instance) {
      BalanceteRepository.instance = new BalanceteRepository();
    }
    return BalanceteRepository.instance;
  }

  public async findByMesEAno(mes: number, ano: number, id_empresa: number) {
    const sql = `
      SELECT b.id_balancete, b.id_conta, c.codigo_conta, c.nome_conta,
             b.saldo_inicial, b.movimento_debito, b.movimento_credito, b.saldo_final
      FROM balancetes b
      JOIN contas c ON b.id_conta = c.id_conta
      WHERE b.mes = ? AND b.ano = ? AND b.id_empresa = ?
      ORDER BY c.codigo_conta ASC;
    `;
    const rows = await executarComandoSQL(sql, [mes, ano, id_empresa]);
    return rows as any[];
  }
}
