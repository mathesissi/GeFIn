export interface RegistroRazao {
    id_transacao: number;
    data: Date;
    descricao: string;
    debito: number;
    credito: number;
    saldo_acumulado: number; // O saldo após esta transação
}

export class LivroRazaoConta {
    codigo_conta: string;
    nome_conta: string;
    saldo_anterior: number;
    registros: RegistroRazao[];
    saldo_final: number;

    constructor(codigo: string, nome: string, saldo_anterior: number) {
        this.codigo_conta = codigo;
        this.nome_conta = nome;
        this.saldo_anterior = saldo_anterior;
        this.registros = [];
        this.saldo_final = saldo_anterior;
    }
}