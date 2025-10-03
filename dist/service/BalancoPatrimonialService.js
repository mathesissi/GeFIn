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
const Contas_1 = require("../model/Contas");
class BalanceteService {
    constructor() {
        this.balanceteRepo = BalanceteRepository_1.BalanceteRepository.getInstance();
        this.contaRepo = ContasRepository_1.ContaRepository.getInstance();
        this.lancamentoRepo = LancamentosRepository_1.LancamentosRepository.getInstance();
    }
    getBalancetePorPeriodo(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Garante que os dados sejam calculados e salvos/atualizados no banco.
            yield this.gerarOuAtualizarBalancete(mes, ano);
            // 2. Busca os dados recém-atualizados.
            const balancetes = yield this.balanceteRepo.findByMesEAno(mes, ano);
            const contas = yield this.contaRepo.findAll();
            const contasMap = new Map(contas.map(c => [c.id_conta, c]));
            // 3. Combina os dados para enviar ao front-end, já com nome e código.
            return balancetes.map(b => {
                const conta = contasMap.get(b.id_conta);
                return Object.assign(Object.assign({}, b), { codigo_conta: (conta === null || conta === void 0 ? void 0 : conta.codigo_conta) || 'N/A', nome_conta: (conta === null || conta === void 0 ? void 0 : conta.nome_conta) || 'Desconhecida' });
            });
        });
    }
    gerarOuAtualizarBalancete(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const contas = yield this.contaRepo.findAll();
            for (const conta of contas) {
                const lancamentos = yield this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
                const saldoAnterior = yield this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);
                let saldoFinal = saldoAnterior;
                const isDevedora = conta.tipo_conta === Contas_1.TipoConta.Ativo || conta.tipo_conta === Contas_1.TipoConta.Despesa;
                for (const lancamento of lancamentos) {
                    if (lancamento.id_conta_debito === conta.id_conta) {
                        saldoFinal += isDevedora ? lancamento.valor : -lancamento.valor;
                    }
                    else if (lancamento.id_conta_credito === conta.id_conta) {
                        saldoFinal += isDevedora ? -lancamento.valor : lancamento.valor;
                    }
                }
                const balanceteExistente = yield this.balanceteRepo.findByMesEAnoAndConta(mes, ano, conta.id_conta);
                if (balanceteExistente) {
                    balanceteExistente.saldo_inicial = saldoAnterior;
                    balanceteExistente.saldo_final = saldoFinal;
                    yield this.balanceteRepo.update(balanceteExistente);
                }
                else {
                    const novoBalancete = new balancete_1.Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal);
                    yield this.balanceteRepo.create(novoBalancete);
                }
            }
        });
    }
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
}
exports.BalanceteService = BalanceteService;
