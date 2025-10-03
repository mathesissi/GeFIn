import { Conta } from './Contas';

export interface BalancoPatrimonial {
    ativo: {
        circulante: Conta[];
        naoCirculante: Conta[];
        total: number;
    };
    passivo: {
        circulante: Conta[];
        naoCirculante: Conta[];
        total: number;
    };
    patrimonioLiquido: {
        contas: Conta[];
        total: number;
    };
    totalAtivo: number;
    totalPassivoPL: number;
}