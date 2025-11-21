export class DRELine {
    codigo: string | null;
    descricao: string;
    valor: number;
    // Adicionado 'titulo' para cabeçalhos sem valor
    tipo: "conta" | "subtotal" | "calculo" | "titulo";
    children: DRELine[];
    nivel: number; // Ajuda o frontend a saber se é negrito (1) ou normal (2)

    constructor(params: {
        codigo?: string | null;
        descricao: string;
        valor?: number;
        tipo: "conta" | "subtotal" | "calculo" | "titulo";
        children?: DRELine[];
        nivel?: number;
    }) {
        this.codigo = params.codigo ?? null;
        this.descricao = params.descricao;
        this.valor = params.valor ?? 0;
        this.tipo = params.tipo;
        this.children = params.children ?? [];
        this.nivel = params.nivel ?? 1;
    }

    addChild(line: DRELine) {
        this.children.push(line);
    }

    // Soma recursiva (Seus filhos somam os filhos deles, etc.)
    calcularTotal() {
        if (this.children.length > 0) {
            this.valor = this.children.reduce((acc, child) => {
                // Se o filho também é um grupo, garante que ele calculou primeiro
                if (child.children.length > 0) child.calcularTotal();
                return acc + child.valor;
            }, 0);
        }
    }
}