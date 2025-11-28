"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroDiarioService = void 0;
const LancamentosRepository_1 = require("../repository/LancamentosRepository");
const MySql_1 = require("../database/MySql");
class LivroDiarioService {
    constructor() {
        this.repo = LancamentosRepository_1.LancamentosRepository.getInstance();
    }
    async gerarLivroDiario(idEmpresa, mes, ano) {
        // Busca lançamentos do mês específico
        const sql = `
            SELECT t.id_transacao, t.data, t.descricao, t.valor_total, t.id_empresa
            FROM transacoes t
            WHERE t.id_empresa = ? 
            AND MONTH(t.data) = ? 
            AND YEAR(t.data) = ?
            ORDER BY t.data ASC, t.id_transacao ASC
        `;
        const lancamentos = await (0, MySql_1.executarComandoSQL)(sql, [idEmpresa, mes, ano]);
        // Para cada lançamento, busca as partidas (débito/crédito)
        for (const lanc of lancamentos) {
            const sqlPartidas = `
                SELECT p.id_conta, p.tipo_partida, p.valor, c.nome_conta, c.codigo_conta
                FROM partidas_lancamento p
                JOIN contas c ON p.id_conta = c.id_conta
                WHERE p.id_transacao = ?
            `;
            lanc.partidas = await (0, MySql_1.executarComandoSQL)(sqlPartidas, [lanc.id_transacao]);
        }
        return lancamentos;
    }
}
exports.LivroDiarioService = LivroDiarioService;
