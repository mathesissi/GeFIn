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
exports.BalancoPatrimonialService = void 0;
const ContasService_1 = require("./ContasService");
const LancamentosService_1 = require("./LancamentosService");
class BalancoPatrimonialService {
    constructor() {
        this.contasService = new ContasService_1.ContasService();
        this.lancamentosService = new LancamentosService_1.LancamentosService();
    }
    gerarBalancete(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const contas = yield this.contasService.listarContas();
            const lancamentos = yield this.lancamentosService.listarLancamentos();
            const balancete = contas.map(conta => {
                const partidasDaConta = lancamentos
                    .flatMap(l => l.partidas.map(p => (Object.assign(Object.assign({}, p), { data: l.data })))) // adiciona a data do lançamento
                    .filter(p => p.id_conta === conta.id_conta &&
                    new Date(p.data).getMonth() + 1 === mes &&
                    new Date(p.data).getFullYear() === ano);
                const total_debito = partidasDaConta
                    .filter(p => p.tipo_partida === 'debito')
                    .reduce((sum, p) => sum + p.valor, 0);
                const total_credito = partidasDaConta
                    .filter(p => p.tipo_partida === 'credito')
                    .reduce((sum, p) => sum + p.valor, 0);
                return {
                    id_conta: conta.id_conta,
                    nome_conta: conta.nome_conta,
                    tipo_conta: conta.tipo_conta,
                    codigo_conta: conta.codigo_conta,
                    total_debito,
                    total_credito,
                    saldo: total_debito - total_credito
                };
            });
            const total_debitos = balancete.reduce((sum, c) => sum + c.total_debito, 0);
            const total_creditos = balancete.reduce((sum, c) => sum + c.total_credito, 0);
            return { contas: balancete, total_debitos, total_creditos };
        });
    }
}
exports.BalancoPatrimonialService = BalancoPatrimonialService;
