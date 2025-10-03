import { Balancete } from "../model/balancete";
import { BalanceteRepository } from "../repository/BalanceteRepository";
import { ContaRepository } from "../repository/ContasRepository";
import { LancamentosRepository } from "../repository/LancamentosRepository";
import { Conta, TipoConta } from "../model/Contas";

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
            const lancamentos = await this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
            const saldoAnterior = await this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);

            let saldoFinal = saldoAnterior;
            const isDevedora = conta.tipo_conta === TipoConta.Ativo || conta.tipo_conta === TipoConta.Despesa;

            for (const lancamento of lancamentos) {
                if (lancamento.id_conta_debito === conta.id_conta) {
                    saldoFinal += isDevedora ? lancamento.valor : -lancamento.valor;
                } else if (lancamento.id_conta_credito === conta.id_conta) {
                    saldoFinal += isDevedora ? -lancamento.valor : lancamento.valor;
                }
            }

            const balanceteExistente = await this.balanceteRepo.findByMesEAnoAndConta(mes, ano, conta.id_conta);

            if (balanceteExistente) {
                balanceteExistente.saldo_inicial = saldoAnterior;
                balanceteExistente.saldo_final = saldoFinal;
                await this.balanceteRepo.update(balanceteExistente);
            } else {
                const novoBalancete = new Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal);
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