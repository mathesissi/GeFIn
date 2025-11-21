"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContaRepository = void 0;
const Contas_1 = require("../model/Contas");
const MySql_1 = require("../database/MySql");
class ContaRepository {
    constructor() { }
    static getInstance() {
        if (!ContaRepository.instance) {
            ContaRepository.instance = new ContaRepository();
        }
        return ContaRepository.instance;
    }
    rowToConta(row) {
        return new Contas_1.Conta(row.id_conta, row.nome_conta, row.tipo_conta, row.codigo_conta, row.id_empresa, row.subtipo_conta || undefined, row.subtipo_secundario || undefined);
    }
    async create(conta) {
        // CORREÇÃO: Adicionado id_empresa na lista de colunas e o '?' correspondente
        const sql = `
      INSERT INTO contas (nome_conta, tipo_conta, subtipo_conta, subtipo_secundario, codigo_conta, id_empresa)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
        const params = [
            conta.nome_conta,
            conta.tipo_conta,
            conta.subtipo_conta || null,
            conta.subtipo_secundario || null,
            conta.codigo_conta,
            conta.id_empresa,
        ];
        const result = await (0, MySql_1.executarComandoSQL)(sql, params);
        const newId = result.insertId;
        const created = await this.findById(newId, conta.id_empresa);
        if (!created)
            throw new Error("Erro ao criar conta");
        return created;
    }
    async findById(id, id_empresa) {
        const sql = "SELECT * FROM contas WHERE id_conta = ? AND id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id, id_empresa]);
        if (result.length > 0) {
            return this.rowToConta(result[0]);
        }
        return null;
    }
    // CORREÇÃO: Adicionado id_empresa para verificar duplicidade apenas dentro da mesma empresa
    async findByCodigoConta(codigoConta, id_empresa) {
        const sql = "SELECT * FROM contas WHERE codigo_conta = ? AND id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [codigoConta, id_empresa]);
        if (result.length > 0) {
            return this.rowToConta(result[0]);
        }
        return null;
    }
    async findAll(id_empresa) {
        const sql = "SELECT * FROM contas WHERE id_empresa = ? ORDER BY codigo_conta;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id_empresa]);
        return result.map((row) => this.rowToConta(row));
    }
    async update(conta) {
        const sql = `
      UPDATE contas
      SET nome_conta = ?, tipo_conta = ?, subtipo_conta = ?, subtipo_secundario = ?, codigo_conta = ?
      WHERE id_conta = ? AND id_empresa = ?;
    `;
        const params = [
            conta.nome_conta,
            conta.tipo_conta,
            conta.subtipo_conta || null,
            conta.subtipo_secundario || null,
            conta.codigo_conta,
            conta.id_conta,
            conta.id_empresa
        ];
        await (0, MySql_1.executarComandoSQL)(sql, params);
        return this.findById(conta.id_conta, conta.id_empresa);
    }
    async delete(id, id_empresa) {
        const sql = "DELETE FROM contas WHERE id_conta = ? AND id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id, id_empresa]);
        return result.affectedRows > 0;
    }
}
exports.ContaRepository = ContaRepository;
