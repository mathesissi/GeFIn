"use strict";
// id_lancamento, data, descricao, valor, id_conta_debito, id_conta_credito
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lancamento = void 0;
class Lancamento {
    id_lancamento;
    data;
    descricao;
    valor;
    id_conta_debito;
    id_conta_credito;
    constructor(id_lancamento, data, descricao, valor, id_conta_debito, id_conta_credito) {
        this.id_lancamento = id_lancamento;
        this.data = data;
        this.descricao = descricao;
        this.valor = valor;
        this.id_conta_debito = id_conta_debito;
        this.id_conta_credito = id_conta_credito;
    }
    exibirLancamento() {
        console.log(`ID: ${this.id_lancamento}`);
        console.log(`Data: ${this.data.toLocaleDateString()}`);
        console.log(`Descrição: ${this.descricao}`);
        console.log(`Valor: R$ ${this.valor.toFixed(2)}`);
        console.log(`Conta de Débito: ${this.id_conta_debito}`);
        console.log(`Conta de Crédito: ${this.id_conta_credito}`);
    }
}
exports.Lancamento = Lancamento;
//# sourceMappingURL=lancamentos.js.map