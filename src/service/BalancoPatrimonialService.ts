import { BalanceteService } from './BalanceteService';
import { ContasService } from './ContasService';
import { Conta, TipoConta, SubtipoAtivo, SubtipoPassivo } from '../model/Contas';
import { Balancete } from '../model/balancete';

// Define a estrutura dos dados que a API vai retornar
interface BalancoItem {
    codigo: string;
    nome: string;
    saldo: number;
}

export interface BalancoPatrimonial {
    ativo: {
        circulante: BalancoItem[];
        naoCirculante: BalancoItem[];
        total: number;
    };
    passivo: {
        circulante: BalancoItem[];
        naoCirculante: BalancoItem[];
        total: number;
    };
    patrimonioLiquido: {
        contas: BalancoItem[];
        total: number;
    };
    totais: {
        totalAtivo: number;
        totalPassivoPL: number;
        diferenca: number;
    }
}

export class BalancoPatrimonialService {
    private balanceteService: BalanceteService;
    private contasService: ContasService;

    constructor() {
        this.balanceteService = new BalanceteService();
        this.contasService = new ContasService();
    }

    public async gerarBalanco(mes: number, ano: number): Promise<BalancoPatrimonial> {
        // Usa o serviço que já corrigimos para pegar os balancetes atualizados
        const balancetesComDadosDasContas = await this.balanceteService.getBalancetePorPeriodo(mes, ano);

        const balanco: BalancoPatrimonial = {
            ativo: { circulante: [], naoCirculante: [], total: 0 },
            passivo: { circulante: [], naoCirculante: [], total: 0 },
            patrimonioLiquido: { contas: [], total: 0 },
            totais: { totalAtivo: 0, totalPassivoPL: 0, diferenca: 0 }
        };

        for (const conta of balancetesComDadosDasContas) {
            const saldoFinal = conta.saldo_final;

            // Ignora contas com saldo zero para um relatório mais limpo
            if (Math.abs(saldoFinal) < 0.01) continue;

            const item: BalancoItem = {
                codigo: conta.codigo_conta,
                nome: conta.nome_conta,
                // Inverte o sinal de passivos e PL para exibição positiva
                saldo: conta.tipo_conta === TipoConta.Ativo ? saldoFinal : -saldoFinal
            };

            switch (conta.tipo_conta) {
                case TipoConta.Ativo:
                    balanco.ativo.total += item.saldo;
                    if (conta.subtipo_conta === SubtipoAtivo.Circulante) {
                        balanco.ativo.circulante.push(item);
                    } else {
                        balanco.ativo.naoCirculante.push(item);
                    }
                    break;
                case TipoConta.Passivo:
                    balanco.passivo.total += item.saldo;
                    if (conta.subtipo_conta === SubtipoPassivo.Circulante) {
                        balanco.passivo.circulante.push(item);
                    } else {
                        balanco.passivo.naoCirculante.push(item);
                    }
                    break;
                case TipoConta.PatrimonioLiquido:
                    balanco.patrimonioLiquido.total += item.saldo;
                    balanco.patrimonioLiquido.contas.push(item);
                    break;
            }
        }

        balanco.totais.totalAtivo = balanco.ativo.total;
        balanco.totais.totalPassivoPL = balanco.passivo.total + balanco.patrimonioLiquido.total;
        balanco.totais.diferenca = balanco.totais.totalAtivo - balanco.totais.totalPassivoPL;

        return balanco;
    }
}