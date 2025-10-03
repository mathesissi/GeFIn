"use strict";
// balancete.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balancete = void 0;
class Balancete {
    constructor(id_balancete, mes, ano, id_conta, saldo_inicial, saldo_final, movimento_debito = 0, movimento_credito = 0) {
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
    isSaldoCorreto() {
        const saldoCalculado = this.saldo_inicial + (this.movimento_debito - this.movimento_credito);
        return Math.abs(this.saldo_final - saldoCalculado) < 0.005;
    }
}
exports.Balancete = Balancete;
