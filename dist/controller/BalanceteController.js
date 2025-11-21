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
exports.BalanceteController = void 0;
// src/controller/BalanceteController.ts
const tsoa_1 = require("tsoa"); // Adicione Security e Request
const BalanceteService_1 = require("../service/BalanceteService");
const express = __importStar(require("express"));
let BalanceteController = class BalanceteController extends tsoa_1.Controller {
    constructor() {
        super();
        this.service = new BalanceteService_1.BalanceteService();
    }
    async getBalancete(mes, ano, request, badRequestResponse) {
        if (!mes || !ano) {
            return badRequestResponse(400, { message: 'Mês e Ano são obrigatórios.' });
        }
        // Extrai o ID da empresa do usuário logado (populado pelo middleware JWT)
        const user = request.user;
        const id_empresa = user?.id_empresa;
        if (!id_empresa) {
            // Se cair aqui, verifique se o @Security está configurado corretamente no seu authentication.ts
            this.setStatus(401);
            throw new Error("Usuário não autenticado ou sem empresa vinculada.");
        }
        try {
            const balancete = await this.service.getBalancete(mes, ano, id_empresa);
            return balancete;
        }
        catch (error) {
            this.setStatus(500);
            return { message: 'Erro ao buscar balancete: ' + error.message };
        }
    }
};
exports.BalanceteController = BalanceteController;
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.Security)("jwt") // Garante que o usuário está logado e request.user existe
    ,
    (0, tsoa_1.SuccessResponse)(200, "OK"),
    (0, tsoa_1.Response)(400, "Requisição Inválida"),
    (0, tsoa_1.Response)(500, "Erro Interno do Servidor"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Request)()),
    __param(3, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Function]),
    __metadata("design:returntype", Promise)
], BalanceteController.prototype, "getBalancete", null);
exports.BalanceteController = BalanceteController = __decorate([
    (0, tsoa_1.Route)("balancete"),
    (0, tsoa_1.Tags)("Balancete"),
    __metadata("design:paramtypes", [])
], BalanceteController);
