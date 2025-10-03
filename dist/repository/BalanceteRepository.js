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
// src/repository/BalanceteRepository.ts
const database_1 = require("../database/database");
class BalanceteRepository {
    constructor() { }
    static getInstance() {
        if (!BalanceteRepository.instance) {
            BalanceteRepository.instance = new BalanceteRepository();
        }
        return BalanceteRepository.instance;
    }
    findByMesEAno(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT b.id_balancete, b.id_conta, c.codigo_conta, c.nome_conta,
             b.saldo_inicial, b.movimento_debito, b.movimento_credito, b.saldo_final
      FROM balancetes b
      JOIN contas c ON b.id_conta = c.id_conta
      WHERE b.mes = ? AND b.ano = ?
      ORDER BY c.codigo_conta ASC;
    `;
            const [rows] = yield database_1.db.query(sql, [mes, ano]);
            return rows;
        });
    }
}
exports.BalanceteRepository = BalanceteRepository;
