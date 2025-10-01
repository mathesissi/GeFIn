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
exports.LancamentosRepository = void 0;
const Lancamento_1 = require("../model/Lancamento");
const MySql_1 = require("../database/MySql");
class LancamentosRepository {
    constructor() {
        this.createTable();
    }
    // Adicione este método à classe LancamentosRepository
    findLinkedLancamentos(id_conta) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
    SELECT id_lancamento, descricao, valor
    FROM lancamentos
    WHERE id_conta_debito = ? OR id_conta_credito = ?;
  `;
            // Repete o ID para verificar os dois campos (débito e crédito)
            const params = [id_conta, id_conta];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            // Retorna os dados brutos com as colunas solicitadas
            return result;
        });
    }
    static getInstance() {
        if (!LancamentosRepository.instance) {
            LancamentosRepository.instance = new LancamentosRepository();
        }
        return LancamentosRepository.instance;
    }
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      CREATE TABLE IF NOT EXISTS lancamentos (
        id_lancamento INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        id_conta_debito INT NOT NULL,
        id_conta_credito INT NOT NULL,
        FOREIGN KEY (id_conta_debito) REFERENCES contas(id_conta),
        FOREIGN KEY (id_conta_credito) REFERENCES contas(id_conta)
      );
    `;
            try {
                yield (0, MySql_1.executarComandoSQL)(sql, []);
                console.log('Tabela "lancamentos" criada ou já existente.');
            }
            catch (error) {
                console.error('Erro ao criar tabela "lancamentos":', error);
            }
        });
    }
    rowToLancamento(row) {
        const data = row.data instanceof Date ? row.data : new Date(row.data);
        if (isNaN(data.getTime())) {
            throw new Error("Formato de data inválido no banco de dados.");
        }
        return new Lancamento_1.Lancamento(row.id_lancamento, data, row.descricao, row.valor, row.id_conta_debito, row.id_conta_credito);
    }
    Create(lancamento) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      INSERT INTO lancamentos (data, descricao, valor, id_conta_debito, id_conta_credito)
      VALUES (?, ?, ?, ?, ?);
    `;
            const params = [
                lancamento.data,
                lancamento.descricao,
                lancamento.valor,
                lancamento.id_conta_debito,
                lancamento.id_conta_credito,
            ];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            const newId = result.insertId;
            const createdLancamento = yield this.Select(newId);
            if (!createdLancamento) {
                throw new Error("Erro ao criar lançamento.");
            }
            return createdLancamento;
        });
    }
    Select(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM lancamentos WHERE id_lancamento = ?;";
            const params = [id];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            if (result.length > 0) {
                return this.rowToLancamento(result[0]);
            }
            return null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM lancamentos;";
            const result = yield (0, MySql_1.executarComandoSQL)(sql, []);
            return result.map((row) => this.rowToLancamento(row));
        });
    }
    Update(lancamento) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      UPDATE lancamentos
      SET data = ?, descricao = ?, valor = ?, id_conta_debito = ?, id_conta_credito = ?
      WHERE id_lancamento = ?;
    `;
            const params = [
                lancamento.data,
                lancamento.descricao,
                lancamento.valor,
                lancamento.id_conta_debito,
                lancamento.id_conta_credito,
                lancamento.id_lancamento,
            ];
            yield (0, MySql_1.executarComandoSQL)(sql, params);
            return this.Select(lancamento.id_lancamento);
        });
    }
    Delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM lancamentos WHERE id_lancamento = ?;";
            const params = [id];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            return result.affectedRows > 0;
        });
    }
    findByContaAndPeriodo(id_conta, mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT * FROM lancamentos
      WHERE (id_conta_debito = ? OR id_conta_credito = ?)
      AND MONTH(data) = ?
      AND YEAR(data) = ?;
    `;
            const params = [id_conta, id_conta, mes, ano];
            const result = yield (0, MySql_1.executarComandoSQL)(sql, params);
            return result.map((row) => this.rowToLancamento(row));
        });
    }
}
exports.LancamentosRepository = LancamentosRepository;
//<pre>ValidateError<br> &nbsp; &nbsp;at ExpressTemplateService.getValidatedArgs (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\@tsoa\runtime\dist\routeGeneration\templates\express\expressTemplateService.js:70:19)<br> &nbsp; &nbsp;at C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:87:49<br> &nbsp; &nbsp;at Generator.next (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:8:71<br> &nbsp; &nbsp;at new Promise (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at __awaiter (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:4:12)<br> &nbsp; &nbsp;at LancamentosController_criarLancamento (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:83:16)<br> &nbsp; &nbsp;at Layer.handleRequest (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\layer.js:152:17)<br> &nbsp; &nbsp;at next (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\route.js:157:13)<br> &nbsp; &nbsp;at Route.dispatch (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\route.js:117:3)</pre>
