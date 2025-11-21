import { executarComandoSQL } from "../database/MySql";

export class DRERepository {
    private static instance: DRERepository;

    private constructor() { }

    public static getInstance(): DRERepository {
        if (!DRERepository.instance) {
            DRERepository.instance = new DRERepository();
        }
        return DRERepository.instance;
    }

    /**
     * Busca os totais agrupados por conta para um determinado tipo (Receita ou Despesa).
     * @param tipo 'Receita' ou 'Despesa'
     * @param mes Mês do relatório
     * @param ano Ano do relatório
     * @param id_empresa ID da empresa logada
     */
    public async getTotaisPorTipoConta(
        tipo: 'Receita' | 'Despesa',
        mes: number,
        ano: number,
        id_empresa: number
    ): Promise<{ codigo: string, nome: string, valor: number, subtipo: string }[]> {

        // Lógica Contábil:
        // Receita (Credora) aumenta com Crédito. Saldo = Crédito - Débito.
        // Despesa (Devedora) aumenta com Débito. Saldo = Débito - Crédito.

        let calculoValor = "";
        if (tipo === 'Receita') {
            calculoValor = "SUM(CASE WHEN p.tipo_partida = 'credito' THEN p.valor ELSE -p.valor END)";
        } else {
            calculoValor = "SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE -p.valor END)";
        }

        const sql = `
            SELECT 
                c.codigo_conta as codigo, 
                c.nome_conta as nome,
                c.subtipo_conta as subtipo,
                ${calculoValor} as valor
            FROM partidas_lancamento p
            JOIN transacoes t ON p.id_transacao = t.id_transacao
            JOIN contas c ON p.id_conta = c.id_conta
            WHERE c.tipo_conta = ?
              AND t.id_empresa = ?
              AND MONTH(t.data) = ?
              AND YEAR(t.data) = ?
            GROUP BY c.id_conta, c.codigo_conta, c.nome_conta, c.subtipo_conta
            HAVING valor > 0
            ORDER BY c.codigo_conta;
        `;

        const result = await executarComandoSQL(sql, [tipo, id_empresa, mes, ano]);

        return result.map((row: any) => ({
            codigo: row.codigo,
            nome: row.nome,
            valor: parseFloat(row.valor),
            subtipo: row.subtipo
        }));
    }
}