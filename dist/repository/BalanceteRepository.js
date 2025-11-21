"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteRepository = void 0;
// src/repository/BalanceteRepository.ts
const MySql_1 = require("../database/MySql");
class BalanceteRepository {
    constructor() { }
    static getInstance() {
        if (!BalanceteRepository.instance) {
            BalanceteRepository.instance = new BalanceteRepository();
        }
        return BalanceteRepository.instance;
    }
    async findByMesEAno(mes, ano, id_empresa) {
        const sql = `
      SELECT b.id_balancete, b.id_conta, c.codigo_conta, c.nome_conta,
             b.saldo_inicial, b.movimento_debito, b.movimento_credito, b.saldo_final
      FROM balancetes b
      JOIN contas c ON b.id_conta = c.id_conta
      WHERE b.mes = ? AND b.ano = ? AND b.id_empresa = ?
      ORDER BY c.codigo_conta ASC;
    `;
        const rows = await (0, MySql_1.executarComandoSQL)(sql, [mes, ano, id_empresa]);
        return rows;
    }
}
exports.BalanceteRepository = BalanceteRepository;
