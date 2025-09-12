export declare enum TipoConta {
    Ativo = "Ativo",
    Passivo = "Passivo",
    PatrimonioLiquido = "Patrim\u00F4nio L\u00EDquido",
    Receita = "Receita",
    Despesa = "Despesa"
}
export declare enum SubtipoAtivo {
    Circulante = "Ativo Circulante",
    NaoCirculante_Realizavel = "Realiz\u00E1vel a Longo Prazo",
    NaoCirculante_Investimento = "Investimento",
    NaoCirculante_Imobilizado = "Imobilizado",
    NaoCirculante_Intangivel = "Intang\u00EDvel"
}
export declare enum SubtipoPassivo {
    Circulante = "Passivo Circulante",
    NaoCirculante = "Passivo N\u00E3o Circulante"
}
export declare enum SubtipoPatrimonioLiquido {
    Geral = "Patrim\u00F4nio L\u00EDquido"
}
export declare class Conta {
    id_conta: number;
    nome_conta: string;
    tipo_conta: TipoConta;
    subtipo_conta?: string;
    codigo_conta: string;
    constructor(id_conta: number, nome_conta: string, tipo_conta: TipoConta, codigo_conta: string, subtipo_conta?: string);
    private validarSubtipo;
    exibirConta(): void;
}
//# sourceMappingURL=Contas.d.ts.map