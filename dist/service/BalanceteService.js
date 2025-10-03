"use strict";
// BalanceteService.ts
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
                return Object.assign(Object.assign({}, b), { codigo_conta: (conta === null || conta === void 0 ? void 0 : conta.codigo_conta) || 'N/A', nome_conta: (conta === null || conta === void 0 ? void 0 : conta.nome_conta) || 'Desconhecida', tipo_conta: (conta === null || conta === void 0 ? void 0 : conta.tipo_conta) || '' });
            });
        });
    }
    gerarOuAtualizarBalancete(mes, ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const contas = yield this.contaRepo.findAll();
            for (const conta of contas) {
                // Busca as transações (Lancamento) completas do período que a conta participa
                const lancamentos = yield this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
                const saldoAnterior = yield this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);
                let saldoFinal = saldoAnterior;
                // Define a natureza da conta (Devedora = Saldo aumenta com Débito e diminui com Crédito)
                const isDevedora = conta.tipo_conta === Contas_1.TipoConta.Ativo || conta.tipo_conta === Contas_1.TipoConta.Despesa;
                let totalDebito = 0;
                let totalCredito = 0;
                for (const lancamento of lancamentos) {
                    // CORREÇÃO: Iterar sobre as partidas do lançamento para encontrar a conta
                    for (const partida of lancamento.partidas) {
                        if (partida.id_conta === conta.id_conta) {
                            const valor = partida.valor;
                            // 1. Soma os movimentos para totalização (novo requisito)
                            if (partida.tipo_partida === 'debito') {
                                totalDebito += valor;
                            }
                            else { // 'credito'
                                totalCredito += valor;
                            }
                            // 2. Aplica o movimento ao saldo final
                            if (partida.tipo_partida === 'debito') {
                                // Débito: Aumenta o saldo em contas devedoras, diminui em credoras
                                saldoFinal += isDevedora ? valor : -valor;
                            }
                            else { // 'credito'
                                // Crédito: Diminui o saldo em contas devedoras, aumenta em credoras
                                saldoFinal += isDevedora ? -valor : valor;
                            }
                        }
                    }
                }
                const balanceteExistente = yield this.balanceteRepo.findByMesEAnoAndConta(mes, ano, conta.id_conta);
                if (balanceteExistente) {
                    balanceteExistente.saldo_inicial = saldoAnterior;
                    balanceteExistente.movimento_debito = totalDebito;
                    balanceteExistente.movimento_credito = totalCredito;
                    balanceteExistente.saldo_final = saldoFinal;
                    yield this.balanceteRepo.update(balanceteExistente);
                }
                else {
                    const novoBalancete = new balancete_1.Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal, totalDebito, totalCredito);
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
