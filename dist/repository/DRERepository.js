"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRERepository = void 0;
const MySql_1 = require("../database/MySql");
class DRERepository {
    constructor() { }
    static getInstance() {
        if (!DRERepository.instance) {
            DRERepository.instance = new DRERepository();
        }
        return DRERepository.instance;
    }
    /**
     * Busca os totais agrupados por conta para um determinado tipo (Receita ou Despesa).
     * @param tipo 'Receita' ou 'Despesa'
     * @param mes Mês do relatório
     * @param ano Ano do relatório
     * @param id_empresa ID da empresa logada
     */
    async getTotaisPorTipoConta(tipo, mes, ano, id_empresa) {
        // Lógica Contábil:
        // Receita (Credora) aumenta com Crédito. Saldo = Crédito - Débito.
        // Despesa (Devedora) aumenta com Débito. Saldo = Débito - Crédito.
        let calculoValor = "";
        if (tipo === 'Receita') {
            calculoValor = "SUM(CASE WHEN p.tipo_partida = 'credito' THEN p.valor ELSE -p.valor END)";
        }
        else {
            calculoValor = "SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE -p.valor END)";
        }
        const sql = `
            SELECT 
                c.codigo_conta as codigo, 
                c.nome_conta as nome,
                c.subtipo_conta as subtipo,
                ${calculoValor} as valor
            FROM partidas_lancamento p
            JOIN transacoes t ON p.id_transacao = t.id_transacao
            JOIN contas c ON p.id_conta = c.id_conta
            WHERE c.tipo_conta = ?
              AND t.id_empresa = ?
              AND MONTH(t.data) = ?
              AND YEAR(t.data) = ?
            GROUP BY c.id_conta, c.codigo_conta, c.nome_conta, c.subtipo_conta
            HAVING valor > 0
            ORDER BY c.codigo_conta;
        `;
        const result = await (0, MySql_1.executarComandoSQL)(sql, [tipo, id_empresa, mes, ano]);
        return result.map((row) => ({
            codigo: row.codigo,
            nome: row.nome,
            valor: parseFloat(row.valor),
            subtipo: row.subtipo
        }));
    }
}
exports.DRERepository = DRERepository;
