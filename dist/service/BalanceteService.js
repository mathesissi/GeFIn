"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteService = void 0;
const BalanceteRepository_1 = require("../repository/BalanceteRepository");
class BalanceteService {
    constructor() {
        this.repository = BalanceteRepository_1.BalanceteRepository.getInstance();
    }
    async getBalancete(mes, ano, idEmpresa) {
        const contas = await this.repository.findByMesEAno(mes, ano, idEmpresa);
        const total_debitos = contas.reduce((acc, c) => acc + Number(c.movimento_debito), 0);
        const total_creditos = contas.reduce((acc, c) => acc + Number(c.movimento_credito), 0);
        return {
            mes,
            ano,
            contas: contas.map(c => ({
                codigo_conta: c.codigo_conta,
                nome_conta: c.nome_conta,
                total_debito: Number(c.movimento_debito),
                total_credito: Number(c.movimento_credito),
            })),
            total_debitos,
            total_creditos,
        };
    }
}
exports.BalanceteService = BalanceteService;
