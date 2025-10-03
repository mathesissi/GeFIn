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
const BalanceteService_1 = require("./BalanceteService");
const ContasService_1 = require("./ContasService");
const Contas_1 = require("../model/Contas");
class BalancoPatrimonialService {
    constructor() {
        this.balanceteService = new BalanceteService_1.BalanceteService();
        this.contasService = new ContasService_1.ContasService();
    }
    gerarBalanco(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            // Usa o serviço que já corrigimos para pegar os balancetes atualizados
            const balancetesComDadosDasContas = yield this.balanceteService.getBalancetePorPeriodo(mes, ano);
            const balanco = {
                ativo: { circulante: [], naoCirculante: [], total: 0 },
                passivo: { circulante: [], naoCirculante: [], total: 0 },
                patrimonioLiquido: { contas: [], total: 0 },
                totais: { totalAtivo: 0, totalPassivoPL: 0, diferenca: 0 }
            };
            for (const conta of balancetesComDadosDasContas) {
                const saldoFinal = conta.saldo_final;
                // Ignora contas com saldo zero para um relatório mais limpo
                if (Math.abs(saldoFinal) < 0.01)
                    continue;
                const item = {
                    codigo: conta.codigo_conta,
                    nome: conta.nome_conta,
                    // Inverte o sinal de passivos e PL para exibição positiva
                    saldo: conta.tipo_conta === Contas_1.TipoConta.Ativo ? saldoFinal : -saldoFinal
                };
                switch (conta.tipo_conta) {
                    case Contas_1.TipoConta.Ativo:
                        balanco.ativo.total += item.saldo;
                        if (conta.subtipo_conta === Contas_1.SubtipoAtivo.Circulante) {
                            balanco.ativo.circulante.push(item);
                        }
                        else {
                            balanco.ativo.naoCirculante.push(item);
                        }
                        break;
                    case Contas_1.TipoConta.Passivo:
                        balanco.passivo.total += item.saldo;
                        if (conta.subtipo_conta === Contas_1.SubtipoPassivo.Circulante) {
                            balanco.passivo.circulante.push(item);
                        }
                        else {
                            balanco.passivo.naoCirculante.push(item);
                        }
                        break;
                    case Contas_1.TipoConta.PatrimonioLiquido:
                        balanco.patrimonioLiquido.total += item.saldo;
                        balanco.patrimonioLiquido.contas.push(item);
                        break;
                }
            }
            balanco.totais.totalAtivo = balanco.ativo.total;
            balanco.totais.totalPassivoPL = balanco.passivo.total + balanco.patrimonioLiquido.total;
            balanco.totais.diferenca = balanco.totais.totalAtivo - balanco.totais.totalPassivoPL;
            return balanco;
        });
    }
}
exports.BalancoPatrimonialService = BalancoPatrimonialService;
