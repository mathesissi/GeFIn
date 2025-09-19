// src/service/BalanceteService.ts

import { Balancete } from "../model/balancete";
import { BalanceteRepository } from "../repository/BalanceteRepository";
import { ContaRepository } from "../repository/ContasRepository"; // Necessário para pegar as contas
import { LancamentosRepository } from "../repository/LancamentosRepository"; // Necessário para pegar os lançamentos

export class BalanceteService {
    private balanceteRepo: BalanceteRepository;
    private contaRepo: ContaRepository;
    private lancamentoRepo: LancamentosRepository;

    constructor(
        balanceteRepo: BalanceteRepository,
        contaRepo: ContaRepository,
        lancamentoRepo: LancamentosRepository
    ) {
        this.balanceteRepo = balanceteRepo;
        this.contaRepo = contaRepo;
        this.lancamentoRepo = lancamentoRepo;
    }

    /**
     * Busca os balancetes de um período específico.
     */
    async getBalancetesPorPeriodo(mes: number, ano: number): Promise<Balancete[]> {
        return this.balanceteRepo.findByMesEAno(mes, ano);
    }

    /**
     * Busca um balancete por ID.
     */
    async getBalancetePorId(id: number): Promise<Balancete | null> {
        return this.balanceteRepo.findById(id);
    }

    /**
     * Calcula o saldo final de cada conta e gera um novo balancete para o mês.
     * @returns Uma lista com os balancetes recém-criados.
     */
    async calcularEGerarBalancetes(mes: number, ano: number): Promise<Balancete[]> {
        const contas = await this.contaRepo.findAll();
        const balancetesCriados: Balancete[] = [];
        
        for (const conta of contas) {
            // Lógica para obter saldo inicial do mês anterior (se existir)
            const saldoAnterior = await this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);

            // Busca todos os lançamentos da conta no período
            const lancamentos = await this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);

            let saldoFinal = saldoAnterior;
            for (const lancamento of lancamentos) {
                if (lancamento.id_conta_debito === conta.id_conta) {
                    saldoFinal += lancamento.valor; // Contas de ativo aumentam com débito
                }
                if (lancamento.id_conta_credito === conta.id_conta) {
                    saldoFinal -= lancamento.valor; // Contas de ativo diminuem com crédito
                }
            }

            // Cria um novo balancete e o salva no repositório
            const novoBalancete = new Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal);
            const balanceteSalvo = await this.balanceteRepo.create(novoBalancete);
            balancetesCriados.push(balanceteSalvo);
        }

        return balancetesCriados;
    }

    private async getSaldoFinalMesAnterior(id_conta: number, mes: number, ano: number): Promise<number> {
        // Lógica para obter o mês e ano anterior
        let mesAnterior = mes - 1;
        let anoAnterior = ano;
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior -= 1;
        }

        const balanceteAnterior = await this.balanceteRepo.findByMesEAnoAndConta(mesAnterior, anoAnterior, id_conta);
        if (balanceteAnterior) {
            return balanceteAnterior.saldo_final;
        }
        return 0; // Saldo inicial é zero se não houver balancete anterior
    }
}