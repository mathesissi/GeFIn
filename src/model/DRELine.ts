export class DRELine {
    codigo: string | null;
    descricao: string;
    valor: number;
    tipo: "conta" | "subtotal" | "calculo" | "titulo";
    children: DRELine[];
    nivel: number;

    // Novos campos para Análise
    analiseVertical?: number;   // % sobre a Receita Bruta
    analiseHorizontal?: number; // % sobre o período anterior

    constructor(params: {
        codigo?: string | null;
        descricao: string;
        valor?: number;
        tipo: "conta" | "subtotal" | "calculo" | "titulo";
        children?: DRELine[];
        nivel?: number;
        analiseVertical?: number;
        analiseHorizontal?: number;
    }) {
        this.codigo = params.codigo ?? null;
        this.descricao = params.descricao;
        this.valor = params.valor ?? 0;
        this.tipo = params.tipo;
        this.children = params.children ?? [];
        this.nivel = params.nivel ?? 1;
        this.analiseVertical = params.analiseVertical;
        this.analiseHorizontal = params.analiseHorizontal;
    }

    addChild(line: DRELine) {
        this.children.push(line);
    }

    calcularTotal() {
        if (this.children.length > 0) {
            this.valor = this.children.reduce((acc, child) => {
                if (child.children.length > 0) child.calcularTotal();
                return acc + child.valor;
            }, 0);
        }
    }
}