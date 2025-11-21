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
exports.ContasController = void 0;
const tsoa_1 = require("tsoa");
const Contas_1 = require("../model/Contas");
const ContasService_1 = require("../service/ContasService");
let ContasController = class ContasController extends tsoa_1.Controller {
    constructor() {
        super();
        this.contasService = new ContasService_1.ContasService();
        this.contasService = new ContasService_1.ContasService();
    }
    /** Criar Conta */
    async criarConta(dadosConta, badRequestResponse) {
        try {
            const novaConta = new Contas_1.Conta(0, dadosConta.nome_conta, dadosConta.tipo_conta, dadosConta.codigo_conta, dadosConta.id_empresa, dadosConta.subtipo_conta, dadosConta.subtipo_secundario);
            this.setStatus(201);
            return this.contasService.criarConta(novaConta);
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    /** Listar contas por empresa */
    async listarContas(id_empresa) {
        return this.contasService.listarContas(id_empresa);
    }
    /** Buscar conta por id */
    async buscarContaPorId(id_empresa, id, notFoundResponse) {
        const conta = await this.contasService.buscarContaPorId(id, id_empresa);
        if (!conta) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }
        return conta;
    }
    /** Atualizar conta */
    async atualizarConta(id_empresa, id, dadosAtualizados, notFoundResponse, badRequestResponse) {
        try {
            const contaAtualizada = await this.contasService.atualizarConta(id, id_empresa, dadosAtualizados);
            if (!contaAtualizada) {
                return notFoundResponse(404, { message: "Conta não encontrada." });
            }
            return contaAtualizada;
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    /** Deletar conta */
    async deletarConta(id_empresa, id, notFoundResponse) {
        const deletado = await this.contasService.deletarConta(id, id_empresa);
        if (!deletado) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }
        this.setStatus(204);
    }
};
exports.ContasController = ContasController;
__decorate([
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "criarConta", null);
__decorate([
    (0, tsoa_1.Get)("{id_empresa}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "listarContas", null);
__decorate([
    (0, tsoa_1.Get)("{id_empresa}/{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "buscarContaPorId", null);
__decorate([
    (0, tsoa_1.Put)("{id_empresa}/{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __param(3, (0, tsoa_1.Res)()),
    __param(4, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Function, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "atualizarConta", null);
__decorate([
    (0, tsoa_1.Delete)("{id_empresa}/{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "deletarConta", null);
exports.ContasController = ContasController = __decorate([
    (0, tsoa_1.Route)("contas"),
    (0, tsoa_1.Tags)("Contas"),
    __metadata("design:paramtypes", [])
], ContasController);
