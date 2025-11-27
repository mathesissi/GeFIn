"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DREService = void 0;
const DRE_1 = require("../model/DRE");
const DRELine_1 = require("../model/DRELine");
const DRERepository_1 = require("../repository/DRERepository");
class DREService {
    constructor() {
        this.repository = DRERepository_1.DRERepository.getInstance();
    }
    async gerarRelatorio(mes, ano, id_empresa) {
        // 1. Busca dados brutos
        const receitasRaw = await this.repository.getTotaisPorTipoConta('Receita', mes, ano, id_empresa);
        const despesasRaw = await this.repository.getTotaisPorTipoConta('Despesa', mes, ano, id_empresa);
        // Estrutura Raiz
        const dreRoot = new DRELine_1.DRELine({ descricao: "DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO", tipo: "titulo", nivel: 0 });
        // --- 1. RECEITA OPERACIONAL BRUTA ---
        const receitaBrutaLine = new DRELine_1.DRELine({ descricao: "1. RECEITA OPERACIONAL BRUTA", tipo: "subtotal" });
        let totalReceitaBruta = 0;
        receitasRaw.forEach(r => {
            // Assumindo que Receita Bruta são contas do grupo 7.1 (exceto financeiras)
            if (!r.nome.includes("Financeira")) {
                receitaBrutaLine.addChild(new DRELine_1.DRELine({ descricao: r.nome, valor: r.valor, codigo: r.codigo, tipo: "conta" }));
            }
        });
        receitaBrutaLine.calcularTotal();
        totalReceitaBruta = receitaBrutaLine.valor; // Base para Análise Vertical
        dreRoot.addChild(receitaBrutaLine);
        // --- 2. DEDUÇÕES DA RECEITA ---
        const deducoesLine = new DRELine_1.DRELine({ descricao: "2. (-) DEDUÇÕES DA RECEITA BRUTA", tipo: "subtotal" });
        // Procurar contas de impostos sobre vendas ou devoluções nos dados de Despesa ou Receita redutora
        despesasRaw.filter(d => d.nome.includes("Imposto") || d.nome.includes("Devoluções")).forEach(d => {
            deducoesLine.addChild(new DRELine_1.DRELine({ descricao: d.nome, valor: -d.valor, codigo: d.codigo, tipo: "conta" }));
        });
        deducoesLine.calcularTotal();
        dreRoot.addChild(deducoesLine);
        // --- 3. RECEITA OPERACIONAL LÍQUIDA ---
        const rol = receitaBrutaLine.valor + deducoesLine.valor;
        dreRoot.addChild(new DRELine_1.DRELine({ descricao: "3. (=) RECEITA OPERACIONAL LÍQUIDA", valor: rol, tipo: "calculo" }));
        // --- 4. CUSTOS (CMV/CPV/CSP) ---
        const custosLine = new DRELine_1.DRELine({ descricao: "4. (-) CUSTOS DAS VENDAS", tipo: "subtotal" });
        despesasRaw.filter(d => d.nome.includes("CMV") || d.nome.includes("CPV") || d.nome.includes("CSP") || d.nome.includes("Custo")).forEach(d => {
            custosLine.addChild(new DRELine_1.DRELine({ descricao: d.nome, valor: -d.valor, codigo: d.codigo, tipo: "conta" }));
        });
        custosLine.calcularTotal();
        dreRoot.addChild(custosLine);
        // --- 5. LUCRO BRUTO ---
        const lucroBruto = rol + custosLine.valor;
        dreRoot.addChild(new DRELine_1.DRELine({ descricao: "5. (=) LUCRO BRUTO", valor: lucroBruto, tipo: "calculo" }));
        // --- 6. DESPESAS OPERACIONAIS ---
        const despesasOpLine = new DRELine_1.DRELine({ descricao: "6. (-) DESPESAS OPERACIONAIS", tipo: "subtotal" });
        // Filtra o que sobrou das despesas (não é custo, não é dedução, não é imposto de renda)
        despesasRaw.filter(d => !d.nome.includes("CMV") && !d.nome.includes("CPV") && !d.nome.includes("Custo") &&
            !d.nome.includes("Imposto") && !d.nome.includes("IRPJ") && !d.nome.includes("CSLL")).forEach(d => {
            despesasOpLine.addChild(new DRELine_1.DRELine({ descricao: d.nome, valor: -d.valor, codigo: d.codigo, tipo: "conta" }));
        });
        despesasOpLine.calcularTotal();
        dreRoot.addChild(despesasOpLine);
        // --- 7. RESULTADO ANTES FINANCEIRO E IMPOSTOS ---
        const resultadoOp = lucroBruto + despesasOpLine.valor;
        dreRoot.addChild(new DRELine_1.DRELine({ descricao: "7. (=) RESULTADO ANTES DO FINANCEIRO", valor: resultadoOp, tipo: "calculo" }));
        // Calcular AV recursivamente
        this.calcularAnaliseVertical(dreRoot, totalReceitaBruta);
        return new DRE_1.DRE(mes, ano, dreRoot);
    }
    calcularAnaliseVertical(line, base) {
        if (base !== 0) {
            // AV = (Valor da Conta / Receita Bruta) * 100
            // Usa Math.abs para mostrar a representatividade independente do sinal
            line.analiseVertical = parseFloat(((Math.abs(line.valor) / base) * 100).toFixed(2));
        }
        else {
            line.analiseVertical = 0;
        }
        if (line.children) {
            line.children.forEach(child => this.calcularAnaliseVertical(child, base));
        }
    }
}
exports.DREService = DREService;
