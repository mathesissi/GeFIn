"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroRazaoService = void 0;
const LivroRazaoRepository_1 = require("../repository/LivroRazaoRepository");
const ContasRepository_1 = require("../repository/ContasRepository");
const LivroRazao_1 = require("../model/LivroRazao");
class LivroRazaoService {
    constructor() {
        this.repository = LivroRazaoRepository_1.LivroRazaoRepository.getInstance();
        this.contaRepo = ContasRepository_1.ContaRepository.getInstance();
    }
    async gerarLivroRazao(mes, ano, id_empresa) {
        const contas = await this.contaRepo.findAll(id_empresa);
        const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
        // Lógica simples para fim do mês
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;
        const relatorio = [];
        for (const conta of contas) {
            // Pula contas sintéticas se necessário, mas aqui processaremos todas analíticas
            // Assumindo que temos apenas analíticas com lançamentos
            const saldoInicial = await this.repository.getSaldoAnterior(conta.id_conta, dataInicio, id_empresa);
            const movimentos = await this.repository.getMovimentacao(conta.id_conta, dataInicio, dataFim, id_empresa);
            if (movimentos.length === 0 && saldoInicial === 0)
                continue;
            const livroConta = new LivroRazao_1.LivroRazaoConta(conta.codigo_conta, conta.nome_conta, saldoInicial);
            let saldoAtual = saldoInicial;
            // Processa linhas e calcula saldo acumulado
            livroConta.registros = movimentos.map((mov) => {
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
exports.LivroRazaoService = LivroRazaoService;
