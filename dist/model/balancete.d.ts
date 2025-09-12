/**
 * Representa um balancete com seus saldos de início e fim do período.
 */
export declare class Balancete {
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
    constructor(id_balancete: string, mes: number, ano: number, id_conta: string, saldo_inicial: number, saldo_final: number);
    /**
     * Calcula a movimentação (créditos e débitos) do mês.
     * @returns O valor da movimentação do mês.
     */
    calcularMovimentacao(): number;
    /**
     * Exibe as informações detalhadas do balancete no console.
     */
    exibirBalancete(): void;
}
//# sourceMappingURL=balancete.d.ts.map