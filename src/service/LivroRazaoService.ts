import { LivroRazaoRepository } from '../repository/LivroRazaoRepository';
import { ContaRepository } from '../repository/ContasRepository';
import { LivroRazaoConta } from '../model/LivroRazao';

export class LivroRazaoService {
    private repository = LivroRazaoRepository.getInstance();
    private contaRepo = ContaRepository.getInstance();

    public async gerarLivroRazao(mes: number, ano: number, id_empresa: number) {
        const contas = await this.contaRepo.findAll(id_empresa);
        const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
        // Lógica simples para fim do mês
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;

        const relatorio: LivroRazaoConta[] = [];

        for (const conta of contas) {
            // Pula contas sintéticas se necessário, mas aqui processaremos todas analíticas
            // Assumindo que temos apenas analíticas com lançamentos

            const saldoInicial = await this.repository.getSaldoAnterior(conta.id_conta, dataInicio, id_empresa);
            const movimentos = await this.repository.getMovimentacao(conta.id_conta, dataInicio, dataFim, id_empresa);

            if (movimentos.length === 0 && saldoInicial === 0) continue;

            const livroConta = new LivroRazaoConta(conta.codigo_conta, conta.nome_conta, saldoInicial);

            let saldoAtual = saldoInicial;

            // Processa linhas e calcula saldo acumulado
            livroConta.registros = movimentos.map((mov: any) => {
                const debito = mov.tipo_partida === 'debito' ? Number(mov.valor) : 0;
                const credito = mov.tipo_partida === 'credito' ? Number(mov.valor) : 0;

                // Natureza da conta define se Debito aumenta ou diminui
                // Simplificação: Débito sempre soma, Crédito sempre subtrai, o sinal final define se é credor/devedor
                // Para exibição contábil correta, precisariamos checar a natureza (Ativo/Despesa = Devedora)

                // Lógica Genérica: Saldo = Saldo Anterior + Debito - Credito
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