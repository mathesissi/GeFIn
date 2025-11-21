"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentosController = void 0;
const tsoa_1 = require("tsoa");
const LancamentosService_1 = require("../service/LancamentosService");
const express = __importStar(require("express"));
let LancamentosController = class LancamentosController extends tsoa_1.Controller {
    constructor() {
        super();
        this.lancamentosService = new LancamentosService_1.LancamentosService();
    }
    async criarLancamento(dadosTransacao, request, badRequestResponse) {
        try {
            const user = request.user;
            const id_empresa = user.id_empresa; // <--- Extraia daqui
            this.setStatus(201);
            return this.lancamentosService.criarLancamento(dadosTransacao, id_empresa);
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    async listarLancamentos(request) {
        const user = request.user;
        const id_empresa = user.id_empresa;
        return this.lancamentosService.listarLancamentos(id_empresa);
    }
    async buscarLancamentoPorId(id, request, notFoundResponse) {
        const user = request.user;
        const id_empresa = user.id_empresa;
        const lancamento = await this.lancamentosService.buscarLancamentoPorId(id, id_empresa);
        if (!lancamento) {
            return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
        }
        return lancamento;
    }
    async atualizarLancamento(id, request, dadosAtualizados, notFoundResponse, badRequestResponse) {
        try {
            const user = request.user;
            const id_empresa = user.id_empresa;
            const lancamentoAtualizado = await this.lancamentosService.atualizarLancamento(id, id_empresa, dadosAtualizados);
            if (!lancamentoAtualizado) {
                return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
            }
            return lancamentoAtualizado;
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    async deletarLancamento(id, request, notFoundResponse) {
        const user = request.user;
        const id_empresa = user.id_empresa;
        const deletado = await this.lancamentosService.deletarLancamento(id, id_empresa);
        if (!deletado) {
            return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
        }
        this.setStatus(204);
    }
};
exports.LancamentosController = LancamentosController;
__decorate([
    (0, tsoa_1.Post)(),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "criarLancamento", null);
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "listarLancamentos", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "buscarLancamentoPorId", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Body)()),
    __param(3, (0, tsoa_1.Res)()),
    __param(4, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Function, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "atualizarLancamento", null);
__decorate([
    (0, tsoa_1.Delete)("{id}"),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "deletarLancamento", null);
exports.LancamentosController = LancamentosController = __decorate([
    (0, tsoa_1.Route)("lancamentos"),
    (0, tsoa_1.Tags)("Lançamentos"),
    __metadata("design:paramtypes", [])
], LancamentosController);
