// src/repository/BalanceteRepository.ts
import { db } from '../database/database';
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

  private async createTable(): Promise<void> {
    const sql = `
        CREATE TABLE IF NOT EXISTS balancetes (
        id_balancete INT AUTO_INCREMENT PRIMARY KEY,
        id_conta INT NOT NULL,
        id_empresa INT NOT NULL,
        mes TINYINT NOT NULL, -- 1 a 12
        ano SMALLINT NOT NULL,
        saldo_inicial DECIMAL(15,2) DEFAULT 0,
        movimento_debito DECIMAL(15,2) DEFAULT 0,
        movimento_credito DECIMAL(15,2) DEFAULT 0,
        saldo_final DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_balancete_conta FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
        CONSTRAINT fk_balancete_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
        CONSTRAINT uq_balancetes_conta_mes_ano UNIQUE (id_conta, id_empresa, mes, ano)
        );
      `;
    try {
      await executarComandoSQL(sql, []);
      console.log('Tabela "balancetes" criada ou já existente.');
    } catch (error) {
      console.error('Erro ao criar tabela "balancetes":', error);
    }
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
