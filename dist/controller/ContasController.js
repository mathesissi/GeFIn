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
exports.ContasController = void 0;
const tsoa_1 = require("tsoa");
const Contas_1 = require("../model/Contas");
const ContasService_1 = require("../service/ContasService");
let ContasController = class ContasController extends tsoa_1.Controller {
    constructor() {
        super();
        this.contasService = new ContasService_1.ContasService();
    }
    criarConta(dadosConta, badRequestResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const novaConta = new Contas_1.Conta(0, // O ID será gerado pelo repositório
                dadosConta.nome_conta, dadosConta.tipo_conta, dadosConta.codigo_conta, dadosConta.subtipo_conta, dadosConta.subtipo_secundario // Passando novo campo
                );
                this.setStatus(201); // Created
                return this.contasService.criarConta(novaConta);
            }
            catch (error) {
                return badRequestResponse(400, { message: error.message });
            }
        });
    }
    listarContas() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contasService.listarContas();
        });
    }
    buscarContaPorId(id, notFoundResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const conta = yield this.contasService.buscarContaPorId(id);
            if (!conta) {
                return notFoundResponse(404, { message: "Conta não encontrada." });
            }
            return conta;
        });
    }
    atualizarConta(id, dadosAtualizados, notFoundResponse, badRequestResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contaAtualizada = yield this.contasService.atualizarConta(id, dadosAtualizados);
                if (!contaAtualizada) {
                    return notFoundResponse(404, { message: "Conta não encontrada." });
                }
                return contaAtualizada;
            }
            catch (error) {
                return badRequestResponse(400, { message: error.message });
            }
        });
    }
    deletarConta(id, notFoundResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletado = yield this.contasService.deletarConta(id);
            if (!deletado) {
                return notFoundResponse(404, { message: "Conta não encontrada." });
            }
            this.setStatus(204); // No Content
        });
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
    (0, tsoa_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "listarContas", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "buscarContaPorId", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Res)()),
    __param(3, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "atualizarConta", null);
__decorate([
    (0, tsoa_1.Delete)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], ContasController.prototype, "deletarConta", null);
exports.ContasController = ContasController = __decorate([
    (0, tsoa_1.Route)("contas"),
    (0, tsoa_1.Tags)("Contas"),
    __metadata("design:paramtypes", [])
], ContasController);
