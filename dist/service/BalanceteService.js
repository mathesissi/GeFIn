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
exports.BalanceteService = void 0;
// src/service/BalanceteService.ts
const BalanceteRepository_1 = require("../repository/BalanceteRepository");
class BalanceteService {
    constructor() {
        this.repository = BalanceteRepository_1.BalanceteRepository.getInstance();
    }
    getBalancete(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const contas = yield this.repository.findByMesEAno(mes, ano);
            const total_debitos = contas.reduce((acc, c) => acc + Number(c.movimento_debito), 0);
            const total_creditos = contas.reduce((acc, c) => acc + Number(c.movimento_credito), 0);
            return {
                mes,
                ano,
                contas: contas.map(c => ({
                    codigo_conta: c.codigo_conta,
                    nome_conta: c.nome_conta,
                    total_debito: Number(c.movimento_debito),
                    total_credito: Number(c.movimento_credito),
                })),
                total_debitos,
                total_creditos,
            };
        });
    }
}
exports.BalanceteService = BalanceteService;
