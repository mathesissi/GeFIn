"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conta = exports.SubtipoPatrimonioLiquido = exports.SubtipoPassivo = exports.SubtipoAtivo = exports.TipoConta = void 0;
/**
 * Tipos principais de conta.
 */
var TipoConta;
(function (TipoConta) {
    TipoConta["Ativo"] = "Ativo";
    TipoConta["Passivo"] = "Passivo";
    TipoConta["PatrimonioLiquido"] = "Patrim\u00F4nio L\u00EDquido";
    TipoConta["Receita"] = "Receita";
    TipoConta["Despesa"] = "Despesa";
})(TipoConta || (exports.TipoConta = TipoConta = {}));
/**
 * Subtipos para contas do tipo "Ativo".
 */
var SubtipoAtivo;
(function (SubtipoAtivo) {
    SubtipoAtivo["Circulante"] = "Ativo Circulante";
    SubtipoAtivo["NaoCirculante_Realizavel"] = "Realiz\u00E1vel a Longo Prazo";
    SubtipoAtivo["NaoCirculante_Investimento"] = "Investimento";
    SubtipoAtivo["NaoCirculante_Imobilizado"] = "Imobilizado";
    SubtipoAtivo["NaoCirculante_Intangivel"] = "Intang\u00EDvel";
})(SubtipoAtivo || (exports.SubtipoAtivo = SubtipoAtivo = {}));
/**
 * Subtipos para contas do tipo "Passivo".
 */
var SubtipoPassivo;
(function (SubtipoPassivo) {
    SubtipoPassivo["Circulante"] = "Passivo Circulante";
    SubtipoPassivo["NaoCirculante"] = "Passivo N\u00E3o Circulante";
})(SubtipoPassivo || (exports.SubtipoPassivo = SubtipoPassivo = {}));
/**
 * Subtipos para Patrimônio Líquido.
 */
var SubtipoPatrimonioLiquido;
(function (SubtipoPatrimonioLiquido) {
    SubtipoPatrimonioLiquido["Geral"] = "Patrim\u00F4nio L\u00EDquido";
})(SubtipoPatrimonioLiquido || (exports.SubtipoPatrimonioLiquido = SubtipoPatrimonioLiquido = {}));
/**
 * Representa uma conta contábil com seus atributos e lógica de validação.
 */
class Conta {
    /**
     * Construtor para criar uma nova instância de Conta.
     * @param id_conta Identificador único da conta.
     * @param nome_conta Nome descritivo da conta.
     * @param tipo_conta O tipo principal da conta (Ativo, Passivo, etc.).
     * @param codigo_conta O código da conta contábil.
     * @param subtipo_conta O subtipo da conta (opcional).
     */
    constructor(id_conta, nome_conta, tipo_conta, codigo_conta, subtipo_conta) {
        this.id_conta = id_conta;
        this.nome_conta = nome_conta;
        this.tipo_conta = tipo_conta;
        this.codigo_conta = codigo_conta;
        if (subtipo_conta && this.validarSubtipo(tipo_conta, subtipo_conta)) {
            this.subtipo_conta = subtipo_conta;
        }
        else if (subtipo_conta) {
            throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
        }
    }
    /**
     * Valida se o subtipo fornecido é válido para o tipo de conta.
     * @param tipo O tipo de conta.
     * @param subtipo O subtipo a ser validado.
     * @returns `true` se o subtipo for válido, `false` caso contrário.
     */
    validarSubtipo(tipo, subtipo) {
        switch (tipo) {
            case TipoConta.Ativo:
                return Object.values(SubtipoAtivo).includes(subtipo);
            case TipoConta.Passivo:
                return Object.values(SubtipoPassivo).includes(subtipo);
            case TipoConta.PatrimonioLiquido:
                return Object.values(SubtipoPatrimonioLiquido).includes(subtipo);
            default:
                return false;
        }
    }
    /**
     * Exibe as informações da conta no console.
     */
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
/* Exemplo de uso da classe Conta
const contaAtivo = new Conta(
  101,
  'Caixa',
  TipoConta.Ativo,
  '1.1.1.01.0001',
  SubtipoAtivo.Circulante
);


const contaReceita = new Conta(
  401,
  'Vendas de Produtos',
  TipoConta.Receita,
  '4.1.1.01.0001'
);

console.log('Dados da Conta Ativo:');
contaAtivo.exibirConta();

console.log('\nDados da Conta Receita:');
contaReceita.exibirConta();
*/
