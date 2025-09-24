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
exports.LancamentosController = void 0;
const tsoa_1 = require("tsoa");
const LancamentosService_1 = require("../service/LancamentosService");
let LancamentosController = class LancamentosController extends tsoa_1.Controller {
    constructor() {
        super();
        this.lancamentosService = new LancamentosService_1.LancamentosService();
    }
    criarLancamento(dadosLancamento, badRequestResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setStatus(201); // Created
                return this.lancamentosService.criarLancamento(dadosLancamento);
            }
            catch (error) {
                return badRequestResponse(400, { message: error.message });
            }
        });
    }
    listarLancamentos() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.lancamentosService.listarLancamentos();
        });
    }
    buscarLancamentoPorId(id, notFoundResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const lancamento = yield this.lancamentosService.buscarLancamentoPorId(id);
            if (!lancamento) {
                return notFoundResponse(404, { message: "Lançamento não encontrado." });
            }
            return lancamento;
        });
    }
    atualizarLancamento(id, dadosAtualizados, notFoundResponse, badRequestResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lancamentoAtualizado = yield this.lancamentosService.atualizarLancamento(id, dadosAtualizados);
                if (!lancamentoAtualizado) {
                    return notFoundResponse(404, { message: "Lançamento não encontrado." });
                }
                return lancamentoAtualizado;
            }
            catch (error) {
                return badRequestResponse(400, { message: error.message });
            }
        });
    }
    deletarLancamento(id, notFoundResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletado = yield this.lancamentosService.deletarLancamento(id);
            if (!deletado) {
                return notFoundResponse(404, { message: "Lançamento não encontrado." });
            }
            this.setStatus(204); // No Content
        });
    }
};
exports.LancamentosController = LancamentosController;
__decorate([
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "criarLancamento", null);
__decorate([
    (0, tsoa_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "listarLancamentos", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "buscarLancamentoPorId", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Res)()),
    __param(3, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "atualizarLancamento", null);
__decorate([
    (0, tsoa_1.Delete)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", Promise)
], LancamentosController.prototype, "deletarLancamento", null);
exports.LancamentosController = LancamentosController = __decorate([
    (0, tsoa_1.Route)("lancamentos"),
    (0, tsoa_1.Tags)("Lançamentos"),
    __metadata("design:paramtypes", [])
], LancamentosController);
