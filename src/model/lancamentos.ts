// id_lancamento, data, descricao, valor, id_conta_debito, id_conta_credito

/**
 * Representa um lançamento contábil, registrando uma transação
 * entre uma conta de débito e uma de crédito.
 */
export class Lancamento {
    id_lancamento: string;
    data: Date;
    descricao: string;
    valor: number;
    id_conta_debito: string;
    id_conta_credito: string;
  
    /**
     * Construtor para criar uma nova instância de Lançamento.
     * @param id_lancamento Identificador único do lançamento.
     * @param data A data em que o lançamento foi realizado.
     * @param descricao Descrição detalhada do lançamento.
     * @param valor O valor monetário da transação.
     * @param id_conta_debito ID da conta que será debitada.
     * @param id_conta_credito ID da conta que será creditada.
     */
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
  
    /**
     * Exibe as informações detalhadas do lançamento no console.
     */
    exibirLancamento(): void {
      console.log(`ID: ${this.id_lancamento}`);
      console.log(`Data: ${this.data.toLocaleDateString()}`);
      console.log(`Descrição: ${this.descricao}`);
      console.log(`Valor: R$ ${this.valor.toFixed(2)}`);
      console.log(`Conta de Débito: ${this.id_conta_debito}`);
      console.log(`Conta de Crédito: ${this.id_conta_credito}`);
    }
  }
  /*
  // Exemplo de uso da classe Lancamento
  const lancamentoExemplo = new Lancamento(
    'lan-001',
    new Date(),
    'Pagamento de aluguel',
    1500.00,
    '501', // Exemplo: Despesa com Aluguel
    '101' // Exemplo: Caixa
  );
  
  console.log('Dados do Lançamento:');
  lancamentoExemplo.exibirLancamento();
  */
  