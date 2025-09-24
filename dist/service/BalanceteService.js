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
const balancete_1 = require("../model/balancete");
const BalanceteRepository_1 = require("../repository/BalanceteRepository");
const ContasRepository_1 = require("../repository/ContasRepository");
const LancamentosRepository_1 = require("../repository/LancamentosRepository");
class BalanceteService {
    constructor() {
        this.balanceteRepo = BalanceteRepository_1.BalanceteRepository.getInstance();
        this.contaRepo = ContasRepository_1.ContaRepository.getInstance();
        this.lancamentoRepo = LancamentosRepository_1.LancamentosRepository.getInstance();
    }
    /**
     * Busca os balancetes de um período específico.
     * @param mes O mês de referência.
     * @param ano O ano de referência.
     * @returns Uma lista de balancetes.
     */
    getBalancetePorPeriodo(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof mes !== 'number' || mes < 1 || mes > 12) {
                throw new Error("Mês inválido. Deve ser um número entre 1 e 12.");
            }
            if (typeof ano !== 'number' || ano < 1900 || ano > 2100) {
                throw new Error("Ano inválido.");
            }
            return this.balanceteRepo.findByMesEAno(mes, ano);
        });
    }
    /**
     * Gera o balancete para todas as contas em um determinado período.
     * @param mes Mês de referência.
     * @param ano Ano de referência.
     * @returns Uma lista dos balancetes criados.
     */
    gerarBalancete(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const contas = yield this.contaRepo.findAll();
            const balancetesCriados = [];
            for (const conta of contas) {
                const lancamentos = yield this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
                const saldoAnterior = yield this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);
                let saldoFinal = saldoAnterior;
                for (const lancamento of lancamentos) {
                    if (lancamento.id_conta_debito === conta.id_conta) {
                        saldoFinal -= lancamento.valor;
                    }
                    else if (lancamento.id_conta_credito === conta.id_conta) {
                        saldoFinal += lancamento.valor;
                    }
                }
                const novoBalancete = new balancete_1.Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal);
                const balanceteSalvo = yield this.balanceteRepo.create(novoBalancete);
                balancetesCriados.push(balanceteSalvo);
            }
            return balancetesCriados;
        });
    }
    /**
     * Busca o saldo final do mês anterior para uma conta específica.
     * @param id_conta ID da conta.
     * @param mes Mês atual.
     * @param ano Ano atual.
     * @returns O saldo final do mês anterior.
     */
    getSaldoFinalMesAnterior(id_conta, mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            let mesAnterior = mes - 1;
            let anoAnterior = ano;
            if (mesAnterior === 0) {
                mesAnterior = 12;
                anoAnterior -= 1;
            }
            const balanceteAnterior = yield this.balanceteRepo.findByMesEAnoAndConta(mesAnterior, anoAnterior, id_conta);
            return balanceteAnterior ? balanceteAnterior.saldo_final : 0;
        });
    }
    atualizarBalancete(balancete) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!balancete.id_balancete || typeof balancete.id_balancete !== 'number' || balancete.id_balancete <= 0) {
                throw new Error("ID do balancete inválido para atualização.");
            }
            // Validações adicionais de negócio podem ser inseridas aqui
            return this.balanceteRepo.update(balancete);
        });
    }
}
exports.BalanceteService = BalanceteService;
