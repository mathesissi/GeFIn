// balancete.ts

export class Balancete {
    id_balancete: number;
    mes: number;
    ano: number;
    id_conta: number;
    saldo_inicial: number;
    saldo_final: number;
    movimento_debito: number;
    movimento_credito: number;

    constructor(
        id_balancete: number,
        mes: number,
        ano: number,
        id_conta: number,
        saldo_inicial: number,
        saldo_final: number,
        movimento_debito: number = 0,
        movimento_credito: number = 0
    ) {
        this.id_balancete = id_balancete;
        this.mes = mes;
        this.ano = ano;
        this.id_conta = id_conta;
        this.saldo_inicial = saldo_inicial;
        this.saldo_final = saldo_final;
        this.movimento_debito = movimento_debito;
        this.movimento_credito = movimento_credito;

        if (mes < 1 || mes > 12) {
            throw new Error("Mês inválido.");
        }
        if (ano < 1900) {
            throw new Error("Ano inválido.");
        }
    }

    public isSaldoCorreto(): boolean {
        const saldoCalculado = this.saldo_inicial + (this.movimento_debito - this.movimento_credito);
        return Math.abs(this.saldo_final - saldoCalculado) < 0.005;
    }
}