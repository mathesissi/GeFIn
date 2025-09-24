import { Balancete } from "../model/balancete";
import { BalanceteRepository } from "../repository/BalanceteRepository";
import { ContaRepository } from "../repository/ContasRepository";
import { LancamentosRepository } from "../repository/LancamentosRepository";
import { Conta } from "../model/Contas";

export class BalanceteService {
    private balanceteRepo: BalanceteRepository;
    private contaRepo: ContaRepository;
    private lancamentoRepo: LancamentosRepository;

    constructor() {
        this.balanceteRepo = BalanceteRepository.getInstance();
        this.contaRepo = ContaRepository.getInstance();
        this.lancamentoRepo = LancamentosRepository.getInstance();
    }

    /**
     * Busca os balancetes de um período específico.
     * @param mes O mês de referência.
     * @param ano O ano de referência.
     * @returns Uma lista de balancetes.
     */
    async getBalancetePorPeriodo(mes: number, ano: number): Promise<Balancete[]> {
        if (typeof mes !== 'number' || mes < 1 || mes > 12) {
            throw new Error("Mês inválido. Deve ser um número entre 1 e 12.");
        }
        if (typeof ano !== 'number' || ano < 1900 || ano > 2100) {
            throw new Error("Ano inválido.");
        }
        return this.balanceteRepo.findByMesEAno(mes, ano);
    }

    /**
     * Gera o balancete para todas as contas em um determinado período.
     * @param mes Mês de referência.
     * @param ano Ano de referência.
     * @returns Uma lista dos balancetes criados.
     */
    public async gerarBalancete(mes: number, ano: number): Promise<Balancete[]> {
        const contas = await this.contaRepo.findAll();
        const balancetesCriados: Balancete[] = [];

        for (const conta of contas) {
            const lancamentos = await this.lancamentoRepo.findByContaAndPeriodo(conta.id_conta, mes, ano);
            const saldoAnterior = await this.getSaldoFinalMesAnterior(conta.id_conta, mes, ano);

            let saldoFinal = saldoAnterior;
            for (const lancamento of lancamentos) {
                if (lancamento.id_conta_debito === conta.id_conta) {
                    saldoFinal -= lancamento.valor;
                } else if (lancamento.id_conta_credito === conta.id_conta) {
                    saldoFinal += lancamento.valor;
                }
            }

            const novoBalancete = new Balancete(0, mes, ano, conta.id_conta, saldoAnterior, saldoFinal);
            const balanceteSalvo = await this.balanceteRepo.create(novoBalancete);
            balancetesCriados.push(balanceteSalvo);
        }

        return balancetesCriados;
    }

    /**
     * Busca o saldo final do mês anterior para uma conta específica.
     * @param id_conta ID da conta.
     * @param mes Mês atual.
     * @param ano Ano atual.
     * @returns O saldo final do mês anterior.
     */
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

    public async atualizarBalancete(balancete: Balancete): Promise<Balancete | null> {
        if (!balancete.id_balancete || typeof balancete.id_balancete !== 'number' || balancete.id_balancete <= 0) {
            throw new Error("ID do balancete inválido para atualização.");
        }
        // Validações adicionais de negócio podem ser inseridas aqui

        return this.balanceteRepo.update(balancete);
    }
}