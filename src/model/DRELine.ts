export class DRELine {
    codigo: string | null;
    descricao: string;
    valor: number | null;
    tipo: "conta" | "subtotal" | "calculo";
    children: DRELine[];
  
    constructor(params: {
      codigo?: string | null;
      descricao: string;
      valor?: number | null;
      tipo: "conta" | "subtotal" | "calculo";
      children?: DRELine[];
    }) {
      this.codigo = params.codigo ?? null;
      this.descricao = params.descricao;
      this.valor = params.valor ?? null;
      this.tipo = params.tipo;
      this.children = params.children ?? [];
    }
  }
  