"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicadoresService = void 0;
const IndicadoresRepository_1 = require("../repository/IndicadoresRepository");
const DRERepository_1 = require("../repository/DRERepository");
class IndicadoresService {
    constructor() {
        this.repo = IndicadoresRepository_1.IndicadoresRepository.getInstance();
        this.dreRepo = DRERepository_1.DRERepository.getInstance();
    }
    async calcular(mes, ano, id_empresa) {
        // Buscando totais por grupo (Códigos padrões de mercado)
        const ativoCirculante = await this.repo.getSaldoPorGrupo('1.1', id_empresa);
        const estoque = await this.repo.getSaldoPorGrupo('1.1.4', id_empresa); // Assumindo 1.1.4 como estoque
        const ativoRealizavelLongoPrazo = await this.repo.getSaldoPorGrupo('1.2', id_empresa);
        const passivoCirculante = await this.repo.getSaldoPorGrupo('2.1', id_empresa); // Grupo 2 Passivo
        const passivoNaoCirculante = await this.repo.getSaldoPorGrupo('2.2', id_empresa);
        const patrimonioLiquido = await this.repo.getSaldoPorGrupo('2.3', id_empresa);
        // Para Lucro Líquido, pegamos o total de Receitas - Total Despesas do ano até o momento
        // Simplificação: pegando do mês atual apenas para demonstração
        const receitas = await this.dreRepo.getTotaisPorTipoConta('Receita', mes, ano, id_empresa);
        const despesas = await this.dreRepo.getTotaisPorTipoConta('Despesa', mes, ano, id_empresa);
        const totalReceita = receitas.reduce((acc, r) => acc + r.valor, 0);
        const totalDespesa = despesas.reduce((acc, d) => acc + d.valor, 0);
        const lucroLiquido = totalReceita - totalDespesa;
        return {
            liquidez: {
                corrente: this.divisaoSegura(ativoCirculante, passivoCirculante),
                seca: this.divisaoSegura(ativoCirculante - estoque, passivoCirculante),
                geral: this.divisaoSegura(ativoCirculante + ativoRealizavelLongoPrazo, passivoCirculante + passivoNaoCirculante)
            },
            rentabilidade: {
                margemLiquida: this.divisaoSegura(lucroLiquido, totalReceita) * 100,
                roe: this.divisaoSegura(lucroLiquido, patrimonioLiquido) * 100
            }
        };
    }
    divisaoSegura(a, b) {
        if (b === 0)
            return 0;
        return Number((a / b).toFixed(4));
    }
}
exports.IndicadoresService = IndicadoresService;
