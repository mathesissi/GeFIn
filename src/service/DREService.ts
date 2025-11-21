import { DRE } from "../model/DRE";
import { DRELine } from "../model/DRELine";
import { DRERepository } from "../repository/DRERepository";


export class DREService {
    private repository: DRERepository;

    constructor() {
        this.repository = DRERepository.getInstance();
    }

    /**
     * Gera a estrutura completa da DRE para o período solicitado.
     */
    public async gerarRelatorio(mes: number, ano: number, id_empresa: number): Promise<DRE> {
        // 1. Busca os saldos agrupados do banco de dados
        const receitasRaw = await this.repository.getTotaisPorTipoConta('Receita', mes, ano, id_empresa);
        const despesasRaw = await this.repository.getTotaisPorTipoConta('Despesa', mes, ano, id_empresa);

        // 2. Separa "Custos" de "Despesas Operacionais"
        // Como o banco não tem um tipo "Custo" explícito, usamos uma convenção:
        // Se o nome da conta ou subtipo contiver "Custo", "CMV" ou "CPV", é Custo.
        const custos: any[] = [];
        const despesasOperacionais: any[] = [];

        despesasRaw.forEach(d => {
            const nome = d.nome.toLowerCase();
            const subtipo = (d.subtipo || '').toLowerCase();

            if (nome.includes('custo') || nome.includes('cmv') || subtipo.includes('custo')) {
                custos.push(d);
            } else {
                despesasOperacionais.push(d);
            }
        });

        // 3. Montagem da Árvore (Tree Structure)

        // Nó Raiz (Título)
        const dreRoot = new DRELine({
            descricao: `Demonstração do Resultado - ${mes}/${ano}`,
            tipo: "titulo", // Título não soma valor
            valor: 0
        });

        // --- GRUPO 1: RECEITA OPERACIONAL BRUTA ---
        const grupoReceita = new DRELine({ descricao: "1. RECEITA OPERACIONAL BRUTA", tipo: "subtotal" });

        receitasRaw.forEach(r => {
            grupoReceita.addChild(new DRELine({
                codigo: r.codigo,
                descricao: `(+) ${r.nome}`,
                valor: r.valor,
                tipo: "conta"
            }));
        });
        grupoReceita.calcularTotal(); // Soma as receitas
        dreRoot.addChild(grupoReceita);

        // --- GRUPO 2: DEDUÇÕES DA RECEITA ---
        // Simulação: 5% sobre a Receita Bruta (ou buscar contas específicas de impostos s/ vendas se houver)
        const deducoesValor = -(grupoReceita.valor * 0.05);
        const linhaDeducoes = new DRELine({
            descricao: "2. (-) DEDUÇÕES DA RECEITA (Impostos)",
            valor: deducoesValor,
            tipo: "calculo"
        });
        dreRoot.addChild(linhaDeducoes);

        // --- CÁLCULO: RECEITA LÍQUIDA ---
        const valReceitaLiquida = grupoReceita.valor + deducoesValor;
        const linhaReceitaLiquida = new DRELine({
            descricao: "3. (=) RECEITA LÍQUIDA",
            valor: valReceitaLiquida,
            tipo: "subtotal" // Subtotal visual
        });
        dreRoot.addChild(linhaReceitaLiquida);

        // --- GRUPO 3: CUSTOS (CMV/CPV) ---
        const grupoCustos = new DRELine({ descricao: "4. (-) CUSTOS DOS PRODUTOS/SERVIÇOS", tipo: "subtotal" });
        custos.forEach(c => {
            grupoCustos.addChild(new DRELine({
                codigo: c.codigo,
                descricao: `(-) ${c.nome}`,
                valor: -Math.abs(c.valor), // Garante que entra subtraindo
                tipo: "conta"
            }));
        });
        grupoCustos.calcularTotal();
        dreRoot.addChild(grupoCustos);

        // --- CÁLCULO: LUCRO BRUTO ---
        const valLucroBruto = valReceitaLiquida + grupoCustos.valor;
        dreRoot.addChild(new DRELine({
            descricao: "5. (=) LUCRO BRUTO",
            valor: valLucroBruto,
            tipo: "subtotal"
        }));

        // --- GRUPO 4: DESPESAS OPERACIONAIS ---
        const grupoDespesas = new DRELine({ descricao: "6. (-) DESPESAS OPERACIONAIS", tipo: "subtotal" });
        despesasOperacionais.forEach(d => {
            grupoDespesas.addChild(new DRELine({
                codigo: d.codigo,
                descricao: `(-) ${d.nome}`,
                valor: -Math.abs(d.valor), // Garante que entra subtraindo
                tipo: "conta"
            }));
        });
        grupoDespesas.calcularTotal();
        dreRoot.addChild(grupoDespesas);

        // --- CÁLCULO: RESULTADO ANTES DO IR (LAIR) ---
        const valLAIR = valLucroBruto + grupoDespesas.valor;
        dreRoot.addChild(new DRELine({
            descricao: "7. (=) RESULTADO ANTES DOS TRIBUTOS (LAIR)",
            valor: valLAIR,
            tipo: "calculo"
        }));

        // --- GRUPO 5: PROVISÃO IRPJ/CSLL (Simulado) ---
        let irpj = 0;
        let csll = 0;
        if (valLAIR > 0) { // Só calcula se houver lucro
            irpj = -(valLAIR * 0.15);
            csll = -(valLAIR * 0.09);
        }

        const grupoImpostos = new DRELine({ descricao: "8. (-) PROVISÃO PARA IRPJ E CSLL", tipo: "subtotal" });
        grupoImpostos.addChild(new DRELine({ descricao: "(-) IRPJ (15%)", valor: irpj, tipo: "calculo" }));
        grupoImpostos.addChild(new DRELine({ descricao: "(-) CSLL (9%)", valor: csll, tipo: "calculo" }));
        grupoImpostos.calcularTotal();
        dreRoot.addChild(grupoImpostos);

        // --- RESULTADO FINAL ---
        const valLucroLiquido = valLAIR + grupoImpostos.valor;
        dreRoot.addChild(new DRELine({
            descricao: "9. (=) LUCRO LÍQUIDO DO EXERCÍCIO",
            valor: valLucroLiquido,
            tipo: "calculo" // Destaque final
        }));

        // Retorna o objeto DRE contendo a raiz da árvore
        return new DRE(mes, ano, dreRoot);
    }
}