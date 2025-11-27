import { LivroRazaoRepository } from '../repository/LivroRazaoRepository';
import { ContaRepository } from '../repository/ContasRepository';
import { LivroRazaoConta } from '../model/LivroRazao';

export class LivroRazaoService {
    private repository = LivroRazaoRepository.getInstance();
    private contaRepo = ContaRepository.getInstance();

    public async gerarLivroRazao(mes: number, ano: number, id_empresa: number) {
        const contas = await this.contaRepo.findAll(id_empresa);
        const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;

        const relatorio: LivroRazaoConta[] = [];

        for (const conta of contas) {
            const saldoInicial = await this.repository.getSaldoAnterior(conta.id_conta, dataInicio, id_empresa);
            const movimentos = await this.repository.getMovimentacao(conta.id_conta, dataInicio, dataFim, id_empresa);

            // Ignora contas sem movimento e sem saldo
            if (movimentos.length === 0 && saldoInicial === 0) continue;

            const livroConta = new LivroRazaoConta(conta.codigo_conta, conta.nome_conta, saldoInicial);
            let saldoAtual = saldoInicial;

            livroConta.registros = movimentos.map((mov: any) => {
                const debito = mov.tipo_partida === 'debito' ? Number(mov.valor) : 0;
                const credito = mov.tipo_partida === 'credito' ? Number(mov.valor) : 0;

                // Lógica de saldo baseada na natureza da conta (simplificada)
                // Ativo/Despesa (Devedora): Aumenta com Débito
                // Passivo/Receita (Credora): Aumenta com Crédito
                // Aqui usamos saldo matemático: Saldo = Anterior + Débito - Crédito
                saldoAtual = saldoAtual + debito - credito;

                return {
                    id_transacao: mov.id_transacao,
                    data: mov.data,
                    descricao: mov.descricao,
                    debito,
                    credito,
                    saldo_acumulado: saldoAtual
                };
            });

            livroConta.saldo_final = saldoAtual;
            relatorio.push(livroConta);
        }
        return relatorio;
    }
}