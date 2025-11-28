// src/model/RelatoriosModel.ts
export interface BalancoLine {
    codigo_conta: string;
    nome_conta: string;
    saldo_atual: number;
    tipo: 'grupo' | 'conta' | 'total';
    nivel: number;
    children: BalancoLine[];
    natureza?: string; // Auxiliar para identificar o tipo (Ativo, Passivo, PL)
}

export interface BalancoPatrimonialReport {
    mes: number;
    ano: number;
    ativo: BalancoLine;
    passivo: BalancoLine;
    patrimonioLiquido: BalancoLine; // Campo obrigatório para o frontend
}