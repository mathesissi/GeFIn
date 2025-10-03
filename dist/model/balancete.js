"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balancete = void 0;
// model/Balancete.ts
class Balancete {
    constructor(id_conta, mes, ano, saldo_inicial = 0, movimento_debito = 0, movimento_credito = 0, saldo_final = 0, id_balancete) {
        this.id_conta = id_conta;
        this.mes = mes;
        this.ano = ano;
        this.saldo_inicial = saldo_inicial;
        this.movimento_debito = movimento_debito;
        this.movimento_credito = movimento_credito;
        this.saldo_final = saldo_final;
        if (id_balancete)
            this.id_balancete = id_balancete;
    }
}
exports.Balancete = Balancete;
