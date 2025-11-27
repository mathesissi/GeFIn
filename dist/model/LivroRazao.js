"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroRazaoConta = void 0;
class LivroRazaoConta {
    constructor(codigo, nome, saldo_anterior) {
        this.codigo_conta = codigo;
        this.nome_conta = nome;
        this.saldo_anterior = saldo_anterior;
        this.registros = [];
        this.saldo_final = saldo_anterior;
    }
}
exports.LivroRazaoConta = LivroRazaoConta;
