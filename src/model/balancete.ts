export class Balancete {
    id_balancete?: number;
    id_conta: number;
    mes: number;
    ano: number;
    saldo_inicial: number;
    movimento_debito: number;
    movimento_credito: number;
    saldo_final: number;
    id_empresa: number;

    constructor(
        id_conta: number,
        mes: number,
        ano: number,
        saldo_inicial = 0,
        movimento_debito = 0,
        movimento_credito = 0,
        saldo_final = 0,
        id_empresa: number,
        id_balancete?: number
    ) {
        this.id_conta = id_conta;
        this.mes = mes;
        this.ano = ano;
        this.saldo_inicial = saldo_inicial;
        this.movimento_debito = movimento_debito;
        this.movimento_credito = movimento_credito;
        this.saldo_final = saldo_final;
        if (id_balancete) this.id_balancete = id_balancete;
        this.id_empresa = id_empresa;
    }
}
