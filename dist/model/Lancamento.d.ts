export declare class Lancamento {
    id_lancamento: string;
    data: Date;
    descricao: string;
    valor: number;
    id_conta_debito: string;
    id_conta_credito: string;
    constructor(id_lancamento: string, data: Date, descricao: string, valor: number, id_conta_debito: string, id_conta_credito: string);
    exibirLancamento(): void;
}
//# sourceMappingURL=Lancamento.d.ts.map