"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContasService = void 0;
const Contas_1 = require("../model/Contas");
const ContasRepository_1 = require("../repository/ContasRepository");
const LancamentosRepository_1 = require("../repository/LancamentosRepository");
class ContasService {
    constructor() {
        this.contasRepository = ContasRepository_1.ContaRepository.getInstance();
        this.lancamentosRepository = LancamentosRepository_1.LancamentosRepository.getInstance();
    }
    async criarConta(conta) {
        if (!conta.nome_conta || !conta.codigo_conta || !conta.tipo_conta) {
            throw new Error("Nome, código e tipo da conta são obrigatórios.");
        }
        if (!Object.values(Contas_1.TipoConta).includes(conta.tipo_conta)) {
            throw new Error(`Tipo de conta inválido: "${conta.tipo_conta}"`);
        }
        // CORREÇÃO: Passando conta.id_empresa para validar unicidade corretamente
        const contaExistente = await this.contasRepository.findByCodigoConta(conta.codigo_conta, conta.id_empresa);
        if (contaExistente) {
            throw new Error(`Já existe uma conta com o código "${conta.codigo_conta}" nesta empresa.`);
        }
        return this.contasRepository.create(conta);
    }
    async buscarContaPorId(id, idEmpresa) {
        if (typeof id !== 'number' || id <= 0 || typeof idEmpresa !== 'number' || idEmpresa <= 0) {
            throw new Error('O ID da conta deve ser um número inteiro positivo.');
        }
        return this.contasRepository.findById(id, idEmpresa);
    }
    async listarContas(idEmpresa) {
        return this.contasRepository.findAll(idEmpresa);
    }
    async atualizarConta(id, id_empresa, dadosAtualizados) {
        const contaExistente = await this.contasRepository.findById(id, id_empresa);
        if (!contaExistente) {
            return null;
        }
        const contaAtualizada = Object.assign({}, contaExistente, dadosAtualizados);
        const tipoAtualizado = contaAtualizada.tipo_conta;
        const tipoSemSubtipo = [Contas_1.TipoConta.Receita, Contas_1.TipoConta.Despesa].includes(tipoAtualizado);
        if (tipoSemSubtipo && !dadosAtualizados.hasOwnProperty('subtipo_conta')) {
            contaAtualizada.subtipo_conta = undefined;
        }
        const contaParaAtualizar = new Contas_1.Conta(contaAtualizada.id_conta, contaAtualizada.nome_conta, contaAtualizada.tipo_conta, contaAtualizada.codigo_conta, contaAtualizada.id_empresa, contaAtualizada.subtipo_conta, contaAtualizada.subtipo_secundario);
        return this.contasRepository.update(contaParaAtualizar);
    }
    async deletarConta(id, id_empresa) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID da conta para deleção é inválido.');
        }
        const lancamentosAtrelados = await this.lancamentosRepository.findLinkedLancamentos(id, id_empresa);
        if (lancamentosAtrelados.length > 0) {
            const lancamentosInfo = lancamentosAtrelados.map(l => ({
                id: l.id_lancamento,
                descricao: l.descricao,
                valor: l.valor
            }));
            const errorMessage = "Não é possível excluir a conta. Lançamentos atrelados encontrados.";
            throw new Error(errorMessage);
        }
        return this.contasRepository.delete(id, id_empresa);
    }
}
exports.ContasService = ContasService;
