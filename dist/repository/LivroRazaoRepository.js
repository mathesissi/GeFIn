"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroRazaoRepository = void 0;
const MySql_1 = require("../database/MySql");
class LivroRazaoRepository {
    constructor() { }
    static getInstance() {
        if (!LivroRazaoRepository.instance) {
            LivroRazaoRepository.instance = new LivroRazaoRepository();
        }
        return LivroRazaoRepository.instance;
    }
    // Busca saldo anterior ao período
    async getSaldoAnterior(id_conta, dataInicio, id_empresa) {
        const sql = `
        SELECT SUM(CASE WHEN tipo_partida = 'debito' THEN valor ELSE -valor END) as saldo
        FROM partidas_lancamento p
        JOIN transacoes t ON p.id_transacao = t.id_transacao
        WHERE p.id_conta = ? AND t.id_empresa = ? AND t.data < ?
    `;
        const res = await (0, MySql_1.executarComandoSQL)(sql, [id_conta, id_empresa, dataInicio]);
        return res[0]?.saldo ? Number(res[0].saldo) : 0;
    }
    // Busca movimentações do período
    async getMovimentacao(id_conta, dataInicio, dataFim, id_empresa) {
        const sql = `
        SELECT t.id_transacao, t.data, t.descricao, p.tipo_partida, p.valor
        FROM partidas_lancamento p
        JOIN transacoes t ON p.id_transacao = t.id_transacao
        WHERE p.id_conta = ? AND t.id_empresa = ? 
        AND t.data >= ? AND t.data <= ?
        ORDER BY t.data ASC, t.id_transacao ASC
    `;
        return await (0, MySql_1.executarComandoSQL)(sql, [id_conta, id_empresa, dataInicio, dataFim]);
    }
}
exports.LivroRazaoRepository = LivroRazaoRepository;
