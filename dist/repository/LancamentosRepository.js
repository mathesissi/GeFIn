"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentosRepository = void 0;
const Lancamento_1 = require("../model/Lancamento");
// 1. CORREÇÃO: Importe 'db' aqui
const MySql_1 = require("../database/MySql");
class LancamentosRepository {
    constructor() { }
    static getInstance() {
        if (!LancamentosRepository.instance) {
            LancamentosRepository.instance = new LancamentosRepository();
        }
        return LancamentosRepository.instance;
    }
    rowToLancamento(row, partidas = []) {
        const data = row.data instanceof Date ? row.data : new Date(row.data);
        return new Lancamento_1.Lancamento(row.id_transacao, data, row.descricao, parseFloat(row.valor_total), partidas, row.id_empresa);
    }
    async fetchPartidas(id_transacao, id_empresa) {
        const sqlPartidas = `
        SELECT id_conta, tipo_partida, valor
        FROM partidas_lancamento
        WHERE id_transacao = ? AND id_empresa = ?;
    `;
        const resultPartidas = await (0, MySql_1.executarComandoSQL)(sqlPartidas, [id_transacao, id_empresa]);
        return resultPartidas.map((r) => ({
            id_conta: r.id_conta,
            tipo_partida: r.tipo_partida,
            valor: parseFloat(r.valor),
        }));
    }
    async Create(lancamento) {
        try {
            const sqlTransacao = `
        INSERT INTO transacoes (data, descricao, valor_total, id_empresa)
        VALUES (?, ?, ?, ?);
      `;
            const paramsTransacao = [
                lancamento.data,
                lancamento.descricao,
                lancamento.valor_total,
                lancamento.id_empresa,
            ];
            const resultTransacao = await (0, MySql_1.executarComandoSQL)(sqlTransacao, paramsTransacao);
            const newId = resultTransacao.insertId;
            const sqlPartida = `
        INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor, id_empresa)
        VALUES ?;
      `;
            const paramsPartidas = lancamento.partidas.map(p => [
                newId,
                p.id_conta,
                p.tipo_partida,
                p.valor,
                lancamento.id_empresa,
            ]);
            if (paramsPartidas.length > 0) {
                // 2. CORREÇÃO: Usar db.query para inserção em lote
                // O 'executarComandoSQL' usa 'execute', que não suporta o placeholder '?' para arrays aninhados
                await MySql_1.db.query(sqlPartida, [paramsPartidas]);
            }
            const createdLancamento = await this.Select(newId, lancamento.id_empresa);
            if (!createdLancamento) {
                throw new Error("Erro ao criar lançamento.");
            }
            return createdLancamento;
        }
        catch (error) {
            throw error;
        }
    }
    // ... Os outros métodos (Select, findAll, Update, Delete...) continuam iguais ...
    async Select(id, id_empresa) {
        const sqlTransacao = "SELECT * FROM transacoes WHERE id_transacao = ? AND id_empresa = ?;";
        const resultTransacao = await (0, MySql_1.executarComandoSQL)(sqlTransacao, [id, id_empresa]);
        if (resultTransacao.length > 0) {
            const transacaoRow = resultTransacao[0];
            const partidasFormatadas = await this.fetchPartidas(id, id_empresa);
            return this.rowToLancamento(transacaoRow, partidasFormatadas);
        }
        return null;
    }
    async findAll(id_empresa) {
        const sql = "SELECT * FROM transacoes WHERE id_empresa = ? ORDER BY data DESC, id_transacao DESC;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id_empresa]);
        const lancamentos = await Promise.all(result.map((row) => this.Select(row.id_transacao, id_empresa)));
        return lancamentos.filter((l) => l !== null);
    }
    async Update(lancamento) {
        try {
            const sqlUpdateTransacao = `
            UPDATE transacoes
            SET data = ?, descricao = ?, valor_total = ?
            WHERE id_transacao = ? AND id_empresa = ?;
        `;
            const paramsUpdateTransacao = [
                lancamento.data,
                lancamento.descricao,
                lancamento.valor_total,
                lancamento.id_lancamento,
                lancamento.id_empresa,
            ];
            await (0, MySql_1.executarComandoSQL)(sqlUpdateTransacao, paramsUpdateTransacao);
            const sqlDeletePartidas = "DELETE FROM partidas_lancamento WHERE id_transacao = ? AND id_empresa = ?;";
            await (0, MySql_1.executarComandoSQL)(sqlDeletePartidas, [lancamento.id_lancamento, lancamento.id_empresa]);
            const sqlInsertPartida = `
            INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor, id_empresa)
            VALUES ?;
        `;
            const paramsInsertPartidas = lancamento.partidas.map(p => [
                lancamento.id_lancamento,
                p.id_conta,
                p.tipo_partida,
                p.valor,
                lancamento.id_empresa,
            ]);
            if (paramsInsertPartidas.length > 0) {
                // CORREÇÃO TAMBÉM NO UPDATE: Usar db.query aqui também!
                await MySql_1.db.query(sqlInsertPartida, [paramsInsertPartidas]);
            }
            return this.Select(lancamento.id_lancamento, lancamento.id_empresa);
        }
        catch (error) {
            throw error;
        }
    }
    async Delete(id, id_empresa) {
        const sql = "DELETE FROM transacoes WHERE id_transacao = ? AND id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id, id_empresa]);
        return result.affectedRows > 0;
    }
    async findLinkedLancamentos(id_conta, id_empresa) {
        const sql = `
        SELECT t.id_transacao, t.descricao, t.valor_total as valor, t.data
        FROM transacoes t
        INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
        WHERE p.id_conta = ? AND t.id_empresa = ?
        GROUP BY t.id_transacao, t.descricao, t.valor_total, t.data
        ORDER BY t.data DESC, t.id_transacao DESC;
    `;
        const params = [id_conta, id_empresa];
        const result = await (0, MySql_1.executarComandoSQL)(sql, params);
        return result.map((row) => ({
            id_lancamento: row.id_transacao,
            descricao: row.descricao,
            valor: parseFloat(row.valor),
            data: row.data,
        }));
    }
}
exports.LancamentosRepository = LancamentosRepository;
