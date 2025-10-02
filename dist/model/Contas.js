"use strict";
//Tipos principais de conta.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conta = exports.SubtipoPassivo = exports.SubtipoAtivo = exports.TipoConta = void 0;
var TipoConta;
(function (TipoConta) {
    TipoConta["Ativo"] = "Ativo";
    TipoConta["Passivo"] = "Passivo";
    TipoConta["PatrimonioLiquido"] = "Patrim\u00F4nio L\u00EDquido";
    TipoConta["Receita"] = "Receita";
    TipoConta["Despesa"] = "Despesa";
})(TipoConta || (exports.TipoConta = TipoConta = {}));
//Subtipos para contas do tipo "Ativo".
var SubtipoAtivo;
(function (SubtipoAtivo) {
    SubtipoAtivo["Circulante"] = "Ativo Circulante";
    SubtipoAtivo["NaoCirculante_Realizavel"] = "Realiz\u00E1vel a Longo Prazo";
    SubtipoAtivo["NaoCirculante_Investimento"] = "Investimento";
    SubtipoAtivo["NaoCirculante_Imobilizado"] = "Imobilizado";
    SubtipoAtivo["NaoCirculante_Intangivel"] = "Intang\u00EDvel";
})(SubtipoAtivo || (exports.SubtipoAtivo = SubtipoAtivo = {}));
// Subtipos para contas do tipo "Passivo".
var SubtipoPassivo;
(function (SubtipoPassivo) {
    SubtipoPassivo["Circulante"] = "Passivo Circulante";
    SubtipoPassivo["NaoCirculante"] = "Passivo N\u00E3o Circulante";
})(SubtipoPassivo || (exports.SubtipoPassivo = SubtipoPassivo = {}));
// [REMOVIDO: SubtipoPatrimonioLiquido redundante]
//Representa uma conta contábil com seus atributos e lógica de validação.
class Conta {
    constructor(id_conta, nome_conta, tipo_conta, codigo_conta, subtipo_conta) {
        this.id_conta = id_conta;
        this.nome_conta = nome_conta;
        this.tipo_conta = tipo_conta;
        this.codigo_conta = codigo_conta;
        // [MODIFICADO] Se for Patrimônio Líquido, o subtipo deve ser ignorado/aceito como vazio, se não for, valida.
        const isPatrimonioLiquido = tipo_conta === TipoConta.PatrimonioLiquido;
        const isReceitaDespesa = tipo_conta === TipoConta.Receita || tipo_conta === TipoConta.Despesa;
        // Se um subtipo foi fornecido e a conta não é Patrimônio Líquido/Receita/Despesa (onde o subtipo é opcional/ignorado), deve ser validado.
        if (subtipo_conta && !isPatrimonioLiquido && !isReceitaDespesa && this.validarSubtipo(tipo_conta, subtipo_conta)) {
            this.subtipo_conta = subtipo_conta;
        }
        else if (subtipo_conta && !isPatrimonioLiquido && !isReceitaDespesa) {
            // Se fornecido e falhou na validação
            throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
        }
        else if (isPatrimonioLiquido || isReceitaDespesa) {
            // Para Patrimônio Líquido, Receita e Despesa, o campo subtipo é opcional/ignorado no back-end,
            // mas pode ter vindo vazio ou null. Apenas garantimos que ele não seja um subtipo de outro tipo.
            this.subtipo_conta = undefined;
        }
        else if (subtipo_conta) {
            // Se a conta exige subtipo e ele veio inválido, lança o erro (Ex: Ativo com subtipo inválido)
            throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
        }
    }
    validarSubtipo(tipo, subtipo) {
        switch (tipo) {
            case TipoConta.Ativo:
                return Object.values(SubtipoAtivo).includes(subtipo);
            case TipoConta.Passivo:
                return Object.values(SubtipoPassivo).includes(subtipo);
            // [REMOVIDO: case TipoConta.PatrimonioLiquido]
            default:
                // Receita, Despesa e outros não listados não requerem validação específica aqui.
                return false;
        }
    }
    exibirConta() {
        console.log(`ID: ${this.id_conta}`);
        console.log(`Nome: ${this.nome_conta}`);
        console.log(`Tipo: ${this.tipo_conta}`);
        if (this.subtipo_conta) {
            console.log(`Subtipo: ${this.subtipo_conta}`);
        }
        console.log(`Código: ${this.codigo_conta}`);
    }
}
exports.Conta = Conta;
