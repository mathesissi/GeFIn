export class DRELine {
    codigo: string | null;
    descricao: string;
    valor: number;
    grupo: string | null;

    constructor(
        codigo: string | null = null,
        descricao: string,
        valor: number = 0,
        grupo: string | null = null
    ) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.valor = valor;
        this.grupo = grupo;
    }

    exibirLinha(): string {
        return `${this.codigo ? this.codigo + " - " : ""}${this.descricao}: R$ ${this.valor.toFixed(2)}`;
    }
}
