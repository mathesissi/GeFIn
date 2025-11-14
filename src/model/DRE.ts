import { DRELine } from "./DRELine";

export class DRE {
    ano: number;
    mes: number | null;
    linhas: DRELine[];

    constructor(ano: number, mes: number | null = null) {
        this.ano = ano;
        this.mes = mes;
        this.linhas = [];
    }

    adicionarLinha(linha: DRELine): void {
        this.linhas.push(linha);
    }

    filtrarPorGrupo(grupo: string): DRELine[] {
        return this.linhas.filter(l => l.grupo === grupo);
    }

    totalizarGrupo(grupo: string): number {
        return this.filtrarPorGrupo(grupo)
            .reduce((total, linha) => total + Number(linha.valor || 0), 0);
    }

    calcularResultado(): number {
        const receitas = this.totalizarGrupo("RECEITAS");
        const despesas = this.totalizarGrupo("DESPESAS");
        return receitas - despesas;
    }

    exibir(): string {
        let output = `DRE - ${this.mes ? this.mes + "/" : ""}${this.ano}\n\n`;

        this.linhas.forEach(l => {
            output += `${l.exibirLinha()}\n`;
        });

        output += `\nResultado: R$ ${this.calcularResultado().toFixed(2)}`;

        return output;
    }
}
