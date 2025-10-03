"use strict";
// BalanceteRepository.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteRepository = void 0;
const balancete_1 = require("../model/balancete");
const MySql_1 = require("../database/MySql");
class BalanceteRepository {
    constructor() {
        this.createTable();
    }
    static getInstance() {
        if (!BalanceteRepository.instance) {
            BalanceteRepository.instance = new BalanceteRepository();
        }
        return BalanceteRepository.instance;
    }
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield (0, MySql_1.executarComandoSQL)(sql, []);
            }
            catch (error) {
                // ...
            }
        });
    }
    rowToBalancete(row) {
        return new balancete_1.Balancete(row.id_balancete, row.mes, row.ano, row.id_conta, parseFloat(row.saldo_inicial), parseFloat(row.saldo_final), parseFloat(row.movimento_debito), parseFloat(row.movimento_credito));
    }
    create(balancete) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            balancete.id_balancete = result.insertId;
            return balancete;
        });
    }
    update(balancete) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield (0, MySql_1.executarComandoSQL)(sql, params);
        });
    }
    findByMesEAno(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `SELECT * FROM balancetes WHERE mes = ? AND ano = ?;`;
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [mes, ano]);
            return result.map(this.rowToBalancete);
        });
    }
    findByMesEAnoAndConta(mes, ano, id_conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `SELECT * FROM balancetes WHERE mes = ? AND ano = ? AND id_conta = ?;`;
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [mes, ano, id_conta]);
            if (result.length > 0) {
                return this.rowToBalancete(result[0]);
            }
            return null;
        });
    }
}
exports.BalanceteRepository = BalanceteRepository;
