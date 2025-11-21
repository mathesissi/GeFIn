"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
class EmpresaService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Cria uma nova empresa, validando a unicidade do CNPJ.
     * @param empresa O objeto Empresa a ser criado.
     * @returns A Empresa criada.
     */
    async criarEmpresa(empresa) {
        if (!empresa.razao_social || !empresa.cnpj) {
            throw new Error("Razão Social e CNPJ são obrigatórios.");
        }
        const empresaExistente = await this.repository.findByCnpj(empresa.cnpj);
        if (empresaExistente) {
            throw new Error(`Já existe uma empresa cadastrada com o CNPJ ${empresa.cnpj}.`);
        }
        return this.repository.create(empresa);
    }
    /**
     * Busca uma empresa pelo ID.
     * @param id O ID da empresa.
     * @returns A Empresa ou null.
     */
    async buscarEmpresaPorId(id) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID da empresa deve ser um número inteiro positivo.');
        }
        return this.repository.findById(id);
    }
    /**
     * Busca uma empresa pelo CNPJ.
     * @param cnpj O CNPJ da empresa.
     * @returns A Empresa ou null.
     */
    async buscarEmpresaPorCnpj(cnpj) {
        return this.repository.findByCnpj(cnpj);
    }
}
exports.EmpresaService = EmpresaService;
