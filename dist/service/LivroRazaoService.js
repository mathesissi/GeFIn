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
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;
        const relatorio = [];
        for (const conta of contas) {
            const saldoInicial = await this.repository.getSaldoAnterior(conta.id_conta, dataInicio, id_empresa);
            const movimentos = await this.repository.getMovimentacao(conta.id_conta, dataInicio, dataFim, id_empresa);
            // Ignora contas sem movimento e sem saldo
            if (movimentos.length === 0 && saldoInicial === 0)
                continue;
            const livroConta = new LivroRazao_1.LivroRazaoConta(conta.codigo_conta, conta.nome_conta, saldoInicial);
            let saldoAtual = saldoInicial;
            livroConta.registros = movimentos.map((mov) => {
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
exports.LivroRazaoService = LivroRazaoService;
