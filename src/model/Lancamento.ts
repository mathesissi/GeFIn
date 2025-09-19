// id_lancamento, data, descricao, valor, id_conta_debito, id_conta_credito

export class Lancamento {
  id_lancamento: string;
  data: Date;
  descricao: string;
  valor: number;
  id_conta_debito: string;
  id_conta_credito: string;

  constructor(
    id_lancamento: string,
    data: Date,
    descricao: string,
    valor: number,
    id_conta_debito: string,
    id_conta_credito: string
  ) {
    this.id_lancamento = id_lancamento;
    this.data = data;
    this.descricao = descricao;
    this.valor = valor;
    this.id_conta_debito = id_conta_debito;
    this.id_conta_credito = id_conta_credito;
  }


  exibirLancamento(): void {
    console.log(`ID: ${this.id_lancamento}`);
    console.log(`Data: ${this.data.toLocaleDateString()}`);
    console.log(`Descrição: ${this.descricao}`);
    console.log(`Valor: R$ ${this.valor.toFixed(2)}`);
    console.log(`Conta de Débito: ${this.id_conta_debito}`);
    console.log(`Conta de Crédito: ${this.id_conta_credito}`);
  }
}