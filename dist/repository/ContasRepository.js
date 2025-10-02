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
exports.ContaRepository = void 0;
const Contas_1 = require("../model/Contas");
const MySql_1 = require("../database/MySql");
class ContaRepository {
    constructor() {
        this.createTable();
    }
    static getInstance() {
        if (!ContaRepository.instance) {
            ContaRepository.instance = new ContaRepository();
        }
        return ContaRepository.instance;
    }
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      CREATE TABLE IF NOT EXISTS contas (
        id_conta INT AUTO_INCREMENT PRIMARY KEY,
        nome_conta VARCHAR(255) NOT NULL,
        tipo_conta ENUM('Ativo', 'Passivo', 'PatrimonioLiquido', 'Receita', 'Despesa') NOT NULL,
        codigo_conta VARCHAR(255) NOT NULL UNIQUE,
        subtipo_conta VARCHAR(255),
        subtipo_secundario VARCHAR(255) 
      );
    `;
            try {
                yield (0, MySql_1.executarComandoSQL)(sql, []);
                console.log('Tabela "contas" criada ou já existente.');
            }
            catch (error) {
                console.error('Erro ao criar tabela "contas":', error);
            }
        });
    }
    rowToConta(row) {
        return new Contas_1.Conta(row.id_conta, row.nome_conta, row.tipo_conta, row.codigo_conta, row.subtipo_conta || undefined, row.subtipo_secundario || undefined);
    }
    create(conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      INSERT INTO contas (nome_conta, tipo_conta, subtipo_conta, subtipo_secundario, codigo_conta)
      VALUES (?, ?, ?, ?, ?);
    `;
            const params = [
                conta.nome_conta,
                conta.tipo_conta,
                conta.subtipo_conta || null,
                conta.subtipo_secundario || null,
                conta.codigo_conta,
            ];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            const newId = result.insertId;
            const created = yield this.findById(newId);
            if (!created)
                throw new Error("Erro ao criar conta");
            return created;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM contas WHERE id_conta = ?;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [id]);
            if (result.length > 0) {
                return this.rowToConta(result[0]);
            }
            return null;
        });
    }
    findByCodigoConta(codigoConta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM contas WHERE codigo_conta = ?;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [codigoConta]);
            if (result.length > 0) {
                return this.rowToConta(result[0]);
            }
            return null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM contas ORDER BY codigo_conta;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, []);
            return result.map((row) => this.rowToConta(row));
        });
    }
    update(conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      UPDATE contas
      SET nome_conta = ?, tipo_conta = ?, subtipo_conta = ?, subtipo_secundario = ?, codigo_conta = ?
      WHERE id_conta = ?;
    `;
            const params = [
                conta.nome_conta,
                conta.tipo_conta,
                conta.subtipo_conta || null,
                conta.subtipo_secundario || null,
                conta.codigo_conta,
                conta.id_conta,
            ];
            yield (0, MySql_1.executarComandoSQL)(sql, params);
            return this.findById(conta.id_conta);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM contas WHERE id_conta = ?;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, [id]);
            return result.affectedRows > 0;
        });
    }
}
exports.ContaRepository = ContaRepository;
