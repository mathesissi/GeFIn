// BalanceteService.ts

import { Balancete } from "../model/balancete";
import { BalanceteRepository } from "../repository/BalanceteRepository";
import { ContaRepository } from "../repository/ContasRepository";
import { LancamentosRepository } from "../repository/LancamentosRepository";
import { Conta, TipoConta } from "../model/Contas";
import { Lancamento, Partida, TipoPartida } from "../model/Lancamento"; 

export class BalanceteService {
    private balanceteRepo: BalanceteRepository;
    private contaRepo: ContaRepository;
    private lancamentoRepo: LancamentosRepository;

    constructor() {
        this.balanceteRepo = BalanceteRepository.getInstance();
        this.contaRepo = ContaRepository.getInstance();
        this.lancamentoRepo = LancamentosRepository.getInstance();
    }

    async getBalancetePorPeriodo(mes: number, ano: number): Promise<any[]> {
        // 1. Garante que os dados sejam calculados e salvos/atualizados no banco.
        await this.gerarOuAtualizarBalancete(mes, ano);

        // 2. Busca os dados recém-atualizados.
        const balancetes = await this.balanceteRepo.findByMesEAno(mes, ano);
        const contas = await this.contaRepo.findAll();
        const contasMap = new Map(contas.map(c => [c.id_conta, c]));

        // 3. Combina os dados para enviar ao front-end, já com nome e código.
        return balancetes.map(b => {
            const conta = contasMap.get(b.id_conta);
            return {
                ...b,
                codigo_conta: conta?.codigo_conta || 'N/A',
                nome_conta: conta?.nome_conta || 'Desconhecida',
                tipo_conta: conta?.tipo_conta || '',
            };
        });
    }

    public async gerarOuAtualizarBalancete(mes: number, ano: number): Promise<void> {
        const contas = await this.contaRepo.findAll();

        for (const conta of contas) {
            // Busca as transações (Lancamento) completas do período que a conta participa
            const lancamentos: Lancamento[] = await this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
            const saldoAnterior = await this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);

            let saldoFinal = saldoAnterior;
            // Define a natureza da conta (Devedora = Saldo aumenta com Débito e diminui com Crédito)
            const isDevedora = conta.tipo_conta === TipoConta.Ativo || conta.tipo_conta === TipoConta.Despesa;
            
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
                        } else { // 'credito'
                            totalCredito += valor;
                        }

                        // 2. Aplica o movimento ao saldo final
                        if (partida.tipo_partida === 'debito') {
                            // Débito: Aumenta o saldo em contas devedoras, diminui em credoras
                            saldoFinal += isDevedora ? valor : -valor;
                        } else { // 'credito'
                            // Crédito: Diminui o saldo em contas devedoras, aumenta em credoras
                            saldoFinal += isDevedora ? -valor : valor;
                        }
                    }
                }
            }

            const balanceteExistente = await this.balanceteRepo.findByMesEAnoAndConta(mes, ano, conta.id_conta);

            if (balanceteExistente) {
                balanceteExistente.saldo_inicial = saldoAnterior;
                balanceteExistente.movimento_debito = totalDebito; 
                balanceteExistente.movimento_credito = totalCredito; 
                balanceteExistente.saldo_final = saldoFinal;
                await this.balanceteRepo.update(balanceteExistente);
            } else {
                const novoBalancete = new Balancete(
                    0, 
                    mes, 
                    ano, 
                    conta.id_conta, 
                    saldoAnterior, 
                    saldoFinal,
                    totalDebito, 
                    totalCredito 
                );
                await this.balanceteRepo.create(novoBalancete);
            }
        }
    }

    private async getSaldoFinalMesAnterior(id_conta: number, mes: number, ano: number): Promise<number> {
        let mesAnterior = mes - 1;
        let anoAnterior = ano;
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior -= 1;
        }
        const balanceteAnterior = await this.balanceteRepo.findByMesEAnoAndConta(mesAnterior, anoAnterior, id_conta);
        return balanceteAnterior ? balanceteAnterior.saldo_final : 0;
    }
}