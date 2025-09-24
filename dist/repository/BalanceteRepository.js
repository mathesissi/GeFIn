"use strict";
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
        saldo_inicial DECIMAL(10, 2) NOT NULL,
        saldo_final DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
        UNIQUE KEY (mes, ano, id_conta)
      );
    `;
            try {
                yield (0, MySql_1.executarComandoSQL)(sql, []);
                console.log('Tabela "balancetes" criada ou já existente.');
            }
            catch (error) {
                console.error('Erro ao criar tabela "balancetes":', error);
            }
        });
    }
    rowToBalancete(row) {
        return new balancete_1.Balancete(Number(row.id_balancete), row.mes, row.ano, Number(row.id_conta), parseFloat(row.saldo_inicial), parseFloat(row.saldo_final));
    }
    create(balancete) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield (0, MySql_1.executarComandoSQL)(query, values);
            const newBalanceteId = Number(result.insertId);
            const createdBalancete = yield this.findById(newBalanceteId);
            if (!createdBalancete) {
                throw new Error("Erro ao criar balancete.");
            }
            return createdBalancete;
        });
    }
    findByMesEAno(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM balancetes WHERE mes = ? AND ano = ?;`;
            const result = yield (0, MySql_1.executarComandoSQL)(query, [mes, ano]);
            return result.map(this.rowToBalancete);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM balancetes WHERE id_balancete = ?;`;
            const result = yield (0, MySql_1.executarComandoSQL)(query, [id]);
            if (result.length > 0) {
                return this.rowToBalancete(result[0]);
            }
            return null;
        });
    }
    findByMesEAnoAndConta(mes, ano, id_conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM balancetes WHERE mes = ? AND ano = ? AND id_conta = ?;`;
            const result = yield (0, MySql_1.executarComandoSQL)(query, [mes, ano, id_conta]);
            if (result.length > 0) {
                return this.rowToBalancete(result[0]);
            }
            return null;
        });
    }
    update(balancete) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield (0, MySql_1.executarComandoSQL)(query, values);
            return this.findById(balancete.id_balancete);
        });
    }
}
exports.BalanceteRepository = BalanceteRepository;
