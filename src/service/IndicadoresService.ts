import { IndicadoresRepository } from '../repository/IndicadoresRepository';
import { DRERepository } from '../repository/DRERepository';

export interface IndicadoresFinanceiros {
    liquidez: {
        corrente: number;
        seca: number;
        geral: number;
    };
    rentabilidade: {
        margemLiquida: number;
        roe: number;
    }
}

export class IndicadoresService {
    private repo = IndicadoresRepository.getInstance();
    private dreRepo = DRERepository.getInstance();

    public async calcular(mes: number, ano: number, id_empresa: number): Promise<IndicadoresFinanceiros> {
        // 1. Buscando saldos do Balanço Patrimonial
        const ativoCirculante = await this.repo.getSaldoPorGrupo('1.1', id_empresa); // Ex: Código 1.1
        const estoque = await this.repo.getSaldoPorGrupo('1.1.4', id_empresa); // Ex: Código de estoque
        const ativoRealizavelLP = await this.repo.getSaldoPorGrupo('1.2', id_empresa);

        const passivoCirculante = await this.repo.getSaldoPorGrupo('2.1', id_empresa);
        const passivoNaoCirculante = await this.repo.getSaldoPorGrupo('2.2', id_empresa);
        const patrimonioLiquido = await this.repo.getSaldoPorGrupo('2.3', id_empresa);

        // 2. Buscando dados da DRE (Receita e Lucro)
        const receitas = await this.dreRepo.getTotaisPorTipoConta('Receita', mes, ano, id_empresa);
        const despesas = await this.dreRepo.getTotaisPorTipoConta('Despesa', mes, ano, id_empresa);

        const totalReceita = receitas.reduce((acc, r) => acc + r.valor, 0);
        const totalDespesa = despesas.reduce((acc, d) => acc + d.valor, 0);
        const lucroLiquido = totalReceita - totalDespesa; // Simplificado

        // 3. Cálculo dos Índices
        return {
            liquidez: {
                corrente: this.divisaoSegura(ativoCirculante, passivoCirculante),
                seca: this.divisaoSegura(ativoCirculante - estoque, passivoCirculante),
                geral: this.divisaoSegura(ativoCirculante + ativoRealizavelLP, passivoCirculante + passivoNaoCirculante)
            },
            rentabilidade: {
                margemLiquida: this.divisaoSegura(lucroLiquido, totalReceita) * 100,
                roe: this.divisaoSegura(lucroLiquido, patrimonioLiquido) * 100
            }
        };
    }

    private divisaoSegura(a: number, b: number): number {
        if (b === 0) return 0;
        return Number((a / b).toFixed(2));
    }
}