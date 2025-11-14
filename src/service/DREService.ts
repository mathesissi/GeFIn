import { DRE } from "../model/DRE";
import { DRELine } from "../model/DRELine";
import { ContasService } from "./ContasService";
import { LancamentosService } from "./LancamentosService";

class _DREService {

  async gerarDRE(ano: number): Promise<DRE> {
    const dre = new DRE(ano);

    const contas = await ContasService.buscarTodasContas();
    const lanc = await LancamentosService.buscarPorAno(ano);

    const valores: Record<string, number> = {};

    for (const l of lanc) {
      if (!valores[l.conta]) valores[l.conta] = 0;
      valores[l.conta] += Number(l.valor);
    }

    const contaValor = (codigo: string) => {
      const c = contas.find(x => x.codigo === codigo);
      if (!c) return 0;
      return valores[c.codigo] ?? 0;
    };

    // Monta todas as linhas
    const estrutura = [
      new DRELine({ descricao: "RECEITA LÍQUIDA", tipo: "conta", valor: contaValor("3.1") }),
      new DRELine({ descricao: "(-) Custo", tipo: "conta", valor: contaValor("6.3") }),
      new DRELine({ descricao: "LUCRO BRUTO", tipo: "subtotal" }),

      new DRELine({ descricao: "Água/Luz", tipo: "conta", valor: contaValor("6.1.1") }),
      new DRELine({ descricao: "Salários", tipo: "conta", valor: contaValor("6.2.1") }),
      new DRELine({ descricao: "Depreciação", tipo: "conta", valor: contaValor("6.4.1") }),

      new DRELine({ descricao: "RESULTADO ANTES DAS RECEITAS E DESPESAS FINANCEIRAS", tipo: "subtotal" }),

      new DRELine({ descricao: "Receita Financeira", tipo: "conta", valor: contaValor("7.2.1") }),
      new DRELine({ descricao: "Despesa Financeira", tipo: "conta", valor: contaValor("6.5.1") }),

      new DRELine({ descricao: "RESULTADO ANTES DOS TRIBUTOS SOBRE O LUCRO", tipo: "subtotal" }),

      new DRELine({ descricao: "(-) IRPJ (15%)", tipo: "calculo" }),
      new DRELine({ descricao: "(-) CSLL (9%)", tipo: "calculo" }),

      new DRELine({ descricao: "LUCRO LÍQUIDO", tipo: "subtotal" }),
    ];

    estrutura.forEach(l => dre.adicionarLinha(l));

    dre.calcularTotais();

    return dre;
  }
}

export const DREService = new _DREService();
