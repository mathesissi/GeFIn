"use strict";
//Tipos principais de conta.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conta = exports.SubtipoPassivo = exports.SubtipoSecundarioAtivo = exports.SubtipoAtivo = exports.TipoConta = void 0;
var TipoConta;
(function (TipoConta) {
    TipoConta["Ativo"] = "Ativo";
    TipoConta["Passivo"] = "Passivo";
    TipoConta["PatrimonioLiquido"] = "Patrimonio Liquido";
    TipoConta["Receita"] = "Receita";
    TipoConta["Despesa"] = "Despesa";
})(TipoConta || (exports.TipoConta = TipoConta = {}));
//Subtipos principais.
var SubtipoAtivo;
(function (SubtipoAtivo) {
    SubtipoAtivo["Circulante"] = "Ativo Circulante";
    SubtipoAtivo["NaoCirculante"] = "Ativo Nao Circulante";
})(SubtipoAtivo || (exports.SubtipoAtivo = SubtipoAtivo = {}));
// Novos Subtipos Secundários para "Ativo Não Circulante"
var SubtipoSecundarioAtivo;
(function (SubtipoSecundarioAtivo) {
    SubtipoSecundarioAtivo["RealizavelLongoPrazo"] = "Realizavel a Longo Prazo";
    SubtipoSecundarioAtivo["Investimento"] = "Investimento";
    SubtipoSecundarioAtivo["Imobilizado"] = "Imobilizado";
    SubtipoSecundarioAtivo["Intangivel"] = "Intangivel";
})(SubtipoSecundarioAtivo || (exports.SubtipoSecundarioAtivo = SubtipoSecundarioAtivo = {}));
// Subtipos para contas do tipo "Passivo".
var SubtipoPassivo;
(function (SubtipoPassivo) {
    SubtipoPassivo["Circulante"] = "Passivo Circulante";
    SubtipoPassivo["NaoCirculante"] = "Passivo Nao Circulante";
})(SubtipoPassivo || (exports.SubtipoPassivo = SubtipoPassivo = {}));
//Representa uma conta contábil com seus atributos e lógica de validação.
class Conta {
    constructor(id_conta, nome_conta, tipo_conta, codigo_conta, subtipo_conta, subtipo_secundario) {
        this.id_conta = id_conta;
        this.nome_conta = nome_conta;
        this.tipo_conta = tipo_conta;
        this.codigo_conta = codigo_conta;
        const primarySubtype = (subtipo_conta === null || subtipo_conta === void 0 ? void 0 : subtipo_conta.trim()) || undefined;
        const secondarySubtype = (subtipo_secundario === null || subtipo_secundario === void 0 ? void 0 : subtipo_secundario.trim()) || undefined;
        const isPatrimonioLiquido = tipo_conta === TipoConta.PatrimonioLiquido;
        const isReceitaDespesa = tipo_conta === TipoConta.Receita || tipo_conta === TipoConta.Despesa;
        const isSubtypeMandatory = tipo_conta === TipoConta.Ativo || tipo_conta === TipoConta.Passivo;
        if (isPatrimonioLiquido || isReceitaDespesa) {
            this.subtipo_conta = undefined;
        }
        else if (isSubtypeMandatory) {
            if (!primarySubtype) {
                throw new Error(`Subtipo principal é obrigatório para contas do tipo "${tipo_conta}"`);
            }
            if (!this.validarSubtipo(tipo_conta, primarySubtype)) {
                throw new Error(`Subtipo principal inválido "${primarySubtype}" para o tipo "${tipo_conta}"`);
            }
            this.subtipo_conta = primarySubtype;
        }
        else if (primarySubtype) {
            throw new Error(`Subtipo principal não é permitido para o tipo "${tipo_conta}"`);
        }
        else {
            this.subtipo_conta = undefined;
        }
        const isAtivoNaoCirculante = tipo_conta === TipoConta.Ativo && primarySubtype === SubtipoAtivo.NaoCirculante;
        if (isAtivoNaoCirculante) {
            if (!secondarySubtype) {
                throw new Error(`Subtipo secundário é obrigatório para "${SubtipoAtivo.NaoCirculante}"`);
            }
            if (!this.validarSubtipoSecundario(secondarySubtype)) {
                throw new Error(`Subtipo secundário inválido "${secondarySubtype}" para "${SubtipoAtivo.NaoCirculante}"`);
            }
            this.subtipo_secundario = secondarySubtype;
        }
        else {
            this.subtipo_secundario = undefined;
        }
    }
    validarSubtipo(tipo, subtipo) {
        switch (tipo) {
            case TipoConta.Ativo:
                return Object.values(SubtipoAtivo).includes(subtipo);
            case TipoConta.Passivo:
                return Object.values(SubtipoPassivo).includes(subtipo);
            default:
                return false;
        }
    }
    validarSubtipoSecundario(subtipoSecundario) {
        return Object.values(SubtipoSecundarioAtivo).includes(subtipoSecundario);
    }
    exibirConta() {
        console.log(`ID: ${this.id_conta}`);
        console.log(`Nome: ${this.nome_conta}`);
        console.log(`Tipo: ${this.tipo_conta}`);
        if (this.subtipo_conta) {
            console.log(`Subtipo: ${this.subtipo_conta}`);
        }
        if (this.subtipo_secundario) {
            console.log(`Subtipo Secundário: ${this.subtipo_secundario}`);
        }
        console.log(`Código: ${this.codigo_conta}`);
    }
}
exports.Conta = Conta;
