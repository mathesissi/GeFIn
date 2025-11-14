import { DRELine } from "./DRELine";

export class DRE {
  ano: number;
  linhas: DRELine[];

  constructor(ano: number) {
    this.ano = ano;
    this.linhas = [];
  }

  adicionarLinha(l: DRELine) {
    this.linhas.push(l);
  }

  calcularTotais() {
    const soma = (arr: DRELine[]) =>
      arr.reduce((t, l) => t + (l.valor ?? 0), 0);

    const get = (desc: string) =>
      this.linhas.find(l => l.descricao === desc);

    // Cálculos automáticos
    const receitaLiquida = get("RECEITA LÍQUIDA")?.valor ?? 0;
    const custo = get("(-) Custo")?.valor ?? 0;

    const lucroBruto = get("LUCRO BRUTO");
    if (lucroBruto) lucroBruto.valor = receitaLiquida - custo;

    const despesasOperacionais = soma([
      get("Água/Luz")!,
      get("Salários")!,
      get("Depreciação")!,
    ]);

    const resultadoAntesFinanceiro = get("RESULTADO ANTES DAS RECEITAS E DESPESAS FINANCEIRAS");
    if (resultadoAntesFinanceiro)
      resultadoAntesFinanceiro.valor =
        lucroBruto?.valor! - despesasOperacionais;

    const receitaFinanceira = get("Receita Financeira")?.valor ?? 0;
    const despesaFinanceira = get("Despesa Financeira")?.valor ?? 0;

    const resultadoAntesTributos = get("RESULTADO ANTES DOS TRIBUTOS SOBRE O LUCRO");
    if (resultadoAntesTributos)
      resultadoAntesTributos.valor =
        resultadoAntesFinanceiro?.valor! +
        receitaFinanceira -
        despesaFinanceira;

    const base = resultadoAntesTributos?.valor ?? 0;

    const irpj = get("(-) IRPJ (15%)");
    if (irpj) irpj.valor = base * 0.15;

    const csll = get("(-) CSLL (9%)");
    if (csll) csll.valor = base * 0.09;

    const lucroLiquido = get("LUCRO LÍQUIDO");
    if (lucroLiquido)
      lucroLiquido.valor = base - (irpj?.valor ?? 0) - (csll?.valor ?? 0);
  }
}
