"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaController = void 0;
const tsoa_1 = require("tsoa");
const Empresa_1 = require("../model/Empresa");
const EmpresaService_1 = require("../service/EmpresaService");
const EmpresaRepository_1 = require("../repository/EmpresaRepository");
let EmpresaController = class EmpresaController extends tsoa_1.Controller {
    // Injeção de Dependência (DI) via construtor
    constructor() {
        super();
        this.empresaService = new EmpresaService_1.EmpresaService(EmpresaRepository_1.EmpresaRepository.getInstance());
    }
    /**
     * Cria uma nova empresa no sistema.
     * Esta rota é geralmente restrita a administradores ou ao fluxo de cadastro inicial (Sign-up).
     */
    async criarEmpresa(dadosEmpresa, badRequestResponse) {
        try {
            const novaEmpresa = new Empresa_1.Empresa(0, dadosEmpresa.razao_social, dadosEmpresa.cnpj);
            this.setStatus(201); // 201 Created
            return this.empresaService.criarEmpresa(novaEmpresa);
        }
        catch (error) {
            // Retorna 400 em caso de erro de validação (ex: CNPJ já existe)
            return badRequestResponse(400, { message: error.message });
        }
    }
    /**
     * Busca uma empresa pelo ID.
     */
    async buscarEmpresaPorId(id, notFoundResponse) {
        const empresa = await this.empresaService.buscarEmpresaPorId(id);
        if (!empresa) {
            return notFoundResponse(404, { message: "Empresa não encontrada." });
        }
        return empresa;
    }
    /**
     * Busca uma empresa pelo CNPJ.
     */
    async buscarEmpresaPorCnpj(cnpj, notFoundResponse) {
        const empresa = await this.empresaService.buscarEmpresaPorCnpj(cnpj);
        if (!empresa) {
            return notFoundResponse(404, { message: "Empresa não encontrada." });
        }
        return empresa;
    }
};
exports.EmpresaController = EmpresaController;
__decorate([
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], EmpresaController.prototype, "criarEmpresa", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], EmpresaController.prototype, "buscarEmpresaPorId", null);
__decorate([
    (0, tsoa_1.Get)("cnpj/{cnpj}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], EmpresaController.prototype, "buscarEmpresaPorCnpj", null);
exports.EmpresaController = EmpresaController = __decorate([
    (0, tsoa_1.Route)("empresas"),
    (0, tsoa_1.Tags)("Empresas"),
    __metadata("design:paramtypes", [])
], EmpresaController);
