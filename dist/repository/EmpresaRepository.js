"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaRepository = void 0;
const Empresa_1 = require("../model/Empresa");
const MySql_1 = require("../database/MySql");
class EmpresaRepository {
    constructor() {
    }
    static getInstance() {
        if (!EmpresaRepository.instance) {
            EmpresaRepository.instance = new EmpresaRepository();
        }
        return EmpresaRepository.instance;
    }
    rowToEmpresa(row) {
        return new Empresa_1.Empresa(row.id_empresa, row.razao_social, row.cnpj);
    }
    async create(empresa) {
        const sql = `INSERT INTO empresas (razao_social, cnpj) VALUES (?, ?);`;
        const params = [empresa.razao_social, empresa.cnpj];
        const result = await (0, MySql_1.executarComandoSQL)(sql, params);
        const newId = result.insertId;
        const created = await this.findById(newId);
        if (!created)
            throw new Error("Erro ao criar empresa");
        return created;
    }
    async findById(id) {
        const sql = "SELECT * FROM empresas WHERE id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }
    async findByRazaoSocial(razao_social) {
        const sql = "SELECT * FROM empresas WHERE razao_social = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [razao_social]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }
    async findByCnpj(cnpj) {
        const sql = "SELECT * FROM empresas WHERE cnpj = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [cnpj]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }
    async findAll() {
        const sql = "SELECT * FROM empresas ORDER BY razao_social;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, []);
        return result.map((row) => this.rowToEmpresa(row));
    }
}
exports.EmpresaRepository = EmpresaRepository;
