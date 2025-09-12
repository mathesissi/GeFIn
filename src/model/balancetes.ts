/**
 * Representa um balancete com seus saldos de início e fim do período.
 */
export class Balancete {
    id_balancete: string;
    mes: number;
    ano: number;
    id_conta: string;
    saldo_inicial: number;
    saldo_final: number;
  
    /**
     * Construtor para criar uma nova instância de Balancete.
     * @param id_balancete O ID único do balancete.
     * @param mes O mês de referência do balancete.
     * @param ano O ano de referência do balancete.
     * @param id_conta O ID da conta relacionada ao balancete.
     * @param saldo_inicial O saldo da conta no início do mês.
     * @param saldo_final O saldo da conta no final do mês.
     */
    constructor(
      id_balancete: string,
      mes: number,
      ano: number,
      id_conta: string,
      saldo_inicial: number,
      saldo_final: number
    ) {
      this.id_balancete = id_balancete;
      this.mes = mes;
      this.ano = ano;
      this.id_conta = id_conta;
      this.saldo_inicial = saldo_inicial;
      this.saldo_final = saldo_final;
    }
  
    /**
     * Calcula a movimentação (créditos e débitos) do mês.
     * @returns O valor da movimentação do mês.
     */
    calcularMovimentacao(): number {
      return this.saldo_final - this.saldo_inicial;
    }
  
    /**
     * Exibe as informações detalhadas do balancete no console.
     */
    exibirBalancete(): void {
      console.log(`ID do Balancete: ${this.id_balancete}`);
      console.log(`Período: ${this.mes}/${this.ano}`);
      console.log(`ID da Conta: ${this.id_conta}`);
      console.log(`Saldo Inicial: R$ ${this.saldo_inicial.toFixed(2)}`);
      console.log(`Saldo Final: R$ ${this.saldo_final.toFixed(2)}`);
    }
  }
  