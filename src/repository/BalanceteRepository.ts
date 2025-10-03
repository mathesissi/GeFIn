// BalanceteRepository.ts

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
                saldo_inicial DECIMAL(12, 2) NOT NULL,
                movimento_debito DECIMAL(12, 2) NOT NULL DEFAULT 0,  -- NOVO CAMPO
                movimento_credito DECIMAL(12, 2) NOT NULL DEFAULT 0, -- NOVO CAMPO
                saldo_final DECIMAL(12, 2) NOT NULL,
                FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
                UNIQUE KEY uk_balancete_periodo_conta (mes, ano, id_conta)
            );
        `;
        try {
            await executarComandoSQL(sql, []);
        } catch (error) {
            // ...
        }
    }

    private rowToBalancete(row: any): Balancete {
        return new Balancete(
            row.id_balancete,
            row.mes,
            row.ano,
            row.id_conta,
            parseFloat(row.saldo_inicial),
            parseFloat(row.saldo_final),
            parseFloat(row.movimento_debito), 
            parseFloat(row.movimento_credito) 
        );
    }

    public async create(balancete: Balancete): Promise<Balancete> {
        const sql = `
            INSERT INTO balancetes (mes, ano, id_conta, saldo_inicial, movimento_debito, movimento_credito, saldo_final)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const params = [
            balancete.mes,
            balancete.ano,
            balancete.id_conta,
            balancete.saldo_inicial,
            balancete.movimento_debito, 
            balancete.movimento_credito, 
            balancete.saldo_final,
        ];
        const result = await executarComandoSQL(sql, params);
        balancete.id_balancete = result.insertId;
        return balancete;
    }

    public async update(balancete: Balancete): Promise<void> {
        const sql = `
            UPDATE balancetes
            SET saldo_inicial = ?,
                movimento_debito = ?,
                movimento_credito = ?,
                saldo_final = ?
            WHERE id_balancete = ?;
        `;
        const params = [
            balancete.saldo_inicial,
            balancete.movimento_debito, 
            balancete.movimento_credito, 
            balancete.saldo_final,
            balancete.id_balancete,
        ];
        await executarComandoSQL(sql, params);
    }

    public async findByMesEAno(mes: number, ano: number): Promise<Balancete[]> {
        const sql = `SELECT * FROM balancetes WHERE mes = ? AND ano = ?;`;
        const result = await executarComandoSQL(sql, [mes, ano]);
        return result.map(this.rowToBalancete);
    }

    public async findByMesEAnoAndConta(mes: number, ano: number, id_conta: number): Promise<Balancete | null> {
        const sql = `SELECT * FROM balancetes WHERE mes = ? AND ano = ? AND id_conta = ?;`;
        const result = await executarComandoSQL(sql, [mes, ano, id_conta]);
        if (result.length > 0) {
            return this.rowToBalancete(result[0]);
        }
        return null;
    }
}