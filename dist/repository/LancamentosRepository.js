"use strict";
// LancamentosRepository.ts
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
exports.LancamentosRepository = void 0;
const Lancamento_1 = require("../model/Lancamento");
const MySql_1 = require("../database/MySql");
class LancamentosRepository {
    constructor() {
        this.createTables();
    }
    // NOTE: This repository assumes that the `transacoes` and `partidas_lancamento` tables exist.
    createTables() {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlTransacoes = `
      CREATE TABLE IF NOT EXISTS transacoes (
        id_transacao INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor_total DECIMAL(12, 2) NOT NULL,
        id_balancete INT
      );
    `;
            const sqlPartidas = `
      CREATE TABLE IF NOT EXISTS partidas_lancamento (
        id_partida INT AUTO_INCREMENT PRIMARY KEY,
        id_transacao INT NOT NULL,
        id_conta INT NOT NULL,
        tipo_partida VARCHAR(7) NOT NULL CHECK (tipo_partida IN ('debito', 'credito')),
        valor DECIMAL(12, 2) NOT NULL,
        FOREIGN KEY (id_transacao) REFERENCES transacoes(id_transacao) ON DELETE CASCADE,
        FOREIGN KEY (id_conta) REFERENCES contas(id_conta)
      );
    `;
            try {
                yield (0, MySql_1.executarComandoSQL)(sqlTransacoes, []);
                yield (0, MySql_1.executarComandoSQL)(sqlPartidas, []);
            }
            catch (error) {
                // ...
            }
        });
    }
    static getInstance() {
        if (!LancamentosRepository.instance) {
            LancamentosRepository.instance = new LancamentosRepository();
        }
        return LancamentosRepository.instance;
    }
    // Mapeia linha do banco de dados para o modelo Lancamento
    rowToLancamento(row, partidas = []) {
        const data = row.data instanceof Date ? row.data : new Date(row.data);
        if (isNaN(data.getTime())) {
            throw new Error("Formato de data inválido no banco de dados.");
        }
        return new Lancamento_1.Lancamento(row.id_transacao, data, row.descricao, parseFloat(row.valor_total), partidas);
    }
    // Função auxiliar para buscar as partidas de uma transação
    fetchPartidas(id_transacao) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlPartidas = `
        SELECT id_conta, tipo_partida, valor
        FROM partidas_lancamento
        WHERE id_transacao = ?;
    `;
            const resultPartidas = yield (0, MySql_1.executarComandoSQL)(sqlPartidas, [id_transacao]);
            return resultPartidas.map((r) => ({
                id_conta: r.id_conta,
                tipo_partida: r.tipo_partida,
                valor: parseFloat(r.valor),
            }));
        });
    }
    Create(lancamento) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Inserir na tabela de transações
                const sqlTransacao = `
        INSERT INTO transacoes (data, descricao, valor_total)
        VALUES (?, ?, ?);
      `;
                const paramsTransacao = [
                    lancamento.data,
                    lancamento.descricao,
                    lancamento.valor_total,
                ];
                const resultTransacao = yield (0, MySql_1.executarComandoSQL)(sqlTransacao, paramsTransacao);
                const newId = resultTransacao.insertId;
                // 2. Inserir na tabela de partidas
                const sqlPartida = `
        INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor)
        VALUES ?;
      `;
                const paramsPartidas = lancamento.partidas.map(p => [
                    newId,
                    p.id_conta,
                    p.tipo_partida,
                    p.valor,
                ]);
                if (paramsPartidas.length > 0) {
                    yield (0, MySql_1.executarComandoSQL)(sqlPartida, [paramsPartidas]);
                }
                // 3. Retornar a transação completa
                const createdLancamento = yield this.Select(newId);
                if (!createdLancamento) {
                    throw new Error("Erro ao criar lançamento.");
                }
                return createdLancamento;
            }
            catch (error) {
                throw error;
            }
        });
    }
    Select(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlTransacao = "SELECT * FROM transacoes WHERE id_transacao = ?;";
            const resultTransacao = yield (0, MySql_1.executarComandoSQL)(sqlTransacao, [id]);
            if (resultTransacao.length > 0) {
                const transacaoRow = resultTransacao[0];
                const partidasFormatadas = yield this.fetchPartidas(id);
                return this.rowToLancamento(transacaoRow, partidasFormatadas);
            }
            return null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM transacoes ORDER BY data DESC, id_transacao DESC;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, []);
            return result.map((row) => this.rowToLancamento(row));
        });
    }
    Update(lancamento) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Atualizar a tabela de transações
                const sqlUpdateTransacao = `
            UPDATE transacoes
            SET data = ?, descricao = ?, valor_total = ?
            WHERE id_transacao = ?;
        `;
                const paramsUpdateTransacao = [
                    lancamento.data,
                    lancamento.descricao,
                    lancamento.valor_total,
                    lancamento.id_lancamento,
                ];
                yield (0, MySql_1.executarComandoSQL)(sqlUpdateTransacao, paramsUpdateTransacao);
                // 2. Excluir as partidas antigas 
                const sqlDeletePartidas = "DELETE FROM partidas_lancamento WHERE id_transacao = ?;";
                yield (0, MySql_1.executarComandoSQL)(sqlDeletePartidas, [lancamento.id_lancamento]);
                // 3. Inserir as novas partidas
                const sqlInsertPartida = `
            INSERT INTO partidas_lancamento (id_transacao, id_conta, tipo_partida, valor)
            VALUES ?;
        `;
                const paramsInsertPartidas = lancamento.partidas.map(p => [
                    lancamento.id_lancamento,
                    p.id_conta,
                    p.tipo_partida,
                    p.valor,
                ]);
                if (paramsInsertPartidas.length > 0) {
                    yield (0, MySql_1.executarComandoSQL)(sqlInsertPartida, [paramsInsertPartidas]);
                }
                return this.Select(lancamento.id_lancamento);
            }
            catch (error) {
                throw error;
            }
        });
    }
    Delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM transacoes WHERE id_transacao = ?;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [id]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Busca transações completas (cabeçalho + partidas) que envolvam a conta no período.
     * @param id_conta O ID da conta.
     * @param mes O mês.
     * @param ano O ano.
     * @returns Uma lista de objetos Lancamento completos.
     */
    findByContaAndPeriodo(id_conta, mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlTransacaoIds = `
      SELECT DISTINCT t.id_transacao
      FROM transacoes t
      INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
      WHERE p.id_conta = ?
      AND MONTH(t.data) = ?
      AND YEAR(t.data) = ?;
    `;
            const params = [id_conta, mes, ano];
            const result = yield (0, MySql_1.executarComandoSQL)(sqlTransacaoIds, params);
            const transacaoIds = result.map((row) => row.id_transacao);
            // Busca cada transação completa (cabeçalho + partidas)
            const lancamentos = yield Promise.all(transacaoIds.map(id => this.Select(id)));
            // Filtra nulos e retorna
            return lancamentos.filter((l) => l !== null);
        });
    }
    findLinkedLancamentos(id_conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
        SELECT t.id_transacao, t.descricao, t.valor_total as valor, t.data
        FROM transacoes t
        INNER JOIN partidas_lancamento p ON t.id_transacao = p.id_transacao
        WHERE p.id_conta = ?
        GROUP BY t.id_transacao, t.descricao, t.valor_total, t.data
        ORDER BY t.data DESC, t.id_transacao DESC;
    `;
            const params = [id_conta];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            return result.map((row) => ({
                id_lancamento: row.id_transacao,
                descricao: row.descricao,
                valor: parseFloat(row.valor),
                data: row.data,
            }));
        });
    }
}
exports.LancamentosRepository = LancamentosRepository;
