// Lancamento.ts

/**
 * Representa uma transação contábil.
 */
export class Lancamento {
  id_lancamento: number;
  data: Date;
  descricao: string;
  valor: number;
  id_conta_debito: number;
  id_conta_credito: number;

  /**
   * Cria uma nova instância de Lancamento.
   * @param id_lancamento O ID único do lançamento.
   * @param data A data do lançamento. (Note: Para APIs, é comum usar strings para datas).
   * @param descricao Uma descrição detalhada da transação.
   * @param valor O valor da transação, deve ser um número positivo.
   * @param id_conta_debito O ID da conta de débito.
   * @param id_conta_credito O ID da conta de crédito.
   */
  constructor(
    id_lancamento: number,
    data: Date,
    descricao: string,
    valor: number,
    id_conta_debito: number,
    id_conta_credito: number
  ) {
    // if (typeof id_lancamento !== 'number' || id_lancamento <= 0) {
    //   throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
    // }
    if (!(data instanceof Date) || isNaN(data.getTime())) {
      throw new Error('A data fornecida é inválida.');
    }
    if (typeof descricao !== 'string' || descricao.trim() === '') {
      throw new Error('A descrição não pode ser vazia.');
    }
    // if (typeof valor !== 'number' || valor <= 0) {
    //   throw new Error('O valor deve ser um número positivo.');
    // }
    if (id_conta_debito === id_conta_credito) {
      throw new Error('As contas de débito e crédito devem ser diferentes.');
    }

    this.id_lancamento = id_lancamento;
    this.data = data;
    this.descricao = descricao;
    this.valor = valor;
    this.id_conta_debito = id_conta_debito;
    this.id_conta_credito = id_conta_credito;
  }

  /**
   * Retorna uma representação formatada do lançamento em uma string.
   * @returns Uma string com os detalhes do lançamento.
   */
  exibirLancamento(): string {
    return `ID: ${this.id_lancamento}\n` +
      `Data: ${this.data.toLocaleDateString()}\n` +
      `Descrição: ${this.descricao}\n` +
      `Valor: R$ ${this.valor.toFixed(2)}\n` +
      `Conta de Débito: ${this.id_conta_debito}\n` +
      `Conta de Crédito: ${this.id_conta_credito}`;
  }
}