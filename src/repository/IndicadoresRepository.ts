import { executarComandoSQL } from '../database/MySql';

export class IndicadoresRepository {
    private static instance: IndicadoresRepository;
    private constructor() { }
    public static getInstance(): IndicadoresRepository {
        if (!IndicadoresRepository.instance) IndicadoresRepository.instance = new IndicadoresRepository();
        return IndicadoresRepository.instance;
    }

    // Soma o saldo de todas as contas que começam com determinado código (Ex: '1.1' para Ativo Circulante)
    public async getSaldoPorGrupo(prefixo: string, id_empresa: number): Promise<number> {
        const sql = `
            SELECT SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE -p.valor END) as saldo
            FROM partidas_lancamento p
            JOIN contas c ON p.id_conta = c.id_conta
            JOIN transacoes t ON p.id_transacao = t.id_transacao
            WHERE c.codigo_conta LIKE CONCAT(?, '%') AND t.id_empresa = ?
        `;
        const res = await executarComandoSQL(sql, [prefixo, id_empresa]);
        // Ajuste: Se for Passivo ou Receita (Natureza Credora), o saldo vem negativo no cálculo matemático simples, 
        // mas para indicadores usamos o módulo ou invertemos dependendo da lógica. 
        // Assumiremos aqui valor absoluto para simplificar a divisão.
        return res[0]?.saldo ? Math.abs(Number(res[0].saldo)) : 0;
    }
}