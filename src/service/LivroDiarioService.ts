import { LancamentosRepository } from '../repository/LancamentosRepository';
import { executarComandoSQL } from '../database/MySql';

export class LivroDiarioService {
    private repo = LancamentosRepository.getInstance();

    public async gerarLivroDiario(idEmpresa: number, mes: number, ano: number) {
        // Busca lançamentos do mês específico
        const sql = `
            SELECT t.id_transacao, t.data, t.descricao, t.valor_total, t.id_empresa
            FROM transacoes t
            WHERE t.id_empresa = ? 
            AND MONTH(t.data) = ? 
            AND YEAR(t.data) = ?
            ORDER BY t.data ASC, t.id_transacao ASC
        `;
        
        const lancamentos = await executarComandoSQL(sql, [idEmpresa, mes, ano]);
        
        // Para cada lançamento, busca as partidas (débito/crédito)
        for (const lanc of lancamentos) {
            const sqlPartidas = `
                SELECT p.id_conta, p.tipo_partida, p.valor, c.nome_conta, c.codigo_conta
                FROM partidas_lancamento p
                JOIN contas c ON p.id_conta = c.id_conta
                WHERE p.id_transacao = ?
            `;
            lanc.partidas = await executarComandoSQL(sqlPartidas, [lanc.id_transacao]);
        }

        return lancamentos;
    }
}