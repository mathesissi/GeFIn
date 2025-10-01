"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    /**
     * Cria uma nova conta, com validações de dados antes de persistir.
     * @param conta Objeto Conta a ser inserido.
     * @returns A conta criada.
     */
    criarConta(conta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!conta.nome_conta || !conta.codigo_conta || !conta.tipo_conta) {
                throw new Error("Nome, código e tipo da conta são obrigatórios.");
            }
            if (!Object.values(Contas_1.TipoConta).includes(conta.tipo_conta)) {
                throw new Error(`Tipo de conta inválido: "${conta.tipo_conta}"`);
            }
            // A validação de subtipo já é realizada no construtor do modelo 'Conta'
            return this.contasRepository.create(conta);
        });
    }
    /**
     * Busca uma conta pelo ID.
     * @param id O ID da conta.
     * @returns A conta encontrada ou `null` se não existir.
     */
    buscarContaPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID da conta deve ser um número inteiro positivo.');
            }
            return this.contasRepository.findById(id);
        });
    }
    /**
     * Lista todas as contas.
     * @returns Uma lista de todas as contas.
     */
    listarContas() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contasRepository.findAll();
        });
    }
    /**
     * Atualiza uma conta com os dados fornecidos.
     * @param id O ID da conta a ser atualizada.
     * @param dadosAtualizados Objeto com os dados para atualizar a conta.
     * @returns A conta atualizada ou `null` se a conta não for encontrada.
     */
    atualizarConta(id, dadosAtualizados) {
        return __awaiter(this, void 0, void 0, function* () {
            const contaExistente = yield this.contasRepository.findById(id);
            if (!contaExistente) {
                return null; // Ou lançar um erro, dependendo da regra de negócio
            }
            const contaAtualizada = Object.assign(contaExistente, dadosAtualizados);
            // Revalida a entidade atualizada
            const contaParaAtualizar = new Contas_1.Conta(contaAtualizada.id_conta, contaAtualizada.nome_conta, contaAtualizada.tipo_conta, contaAtualizada.codigo_conta, contaAtualizada.subtipo_conta);
            return this.contasRepository.update(contaParaAtualizar);
        });
    }
    /**
         * Deleta uma conta pelo ID, validando se há lançamentos atrelados.
         * @param id O ID da conta a ser deletada.
         * @returns `true` se a deleção foi bem-sucedida.
         * @throws {Error} Se o ID for inválido ou se houver lançamentos atrelados.
         */
    deletarConta(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID da conta para deleção é inválido.');
            }
            // 1. Verificar se há lançamentos atrelados
            const lancamentosAtrelados = yield this.lancamentosRepository.findLinkedLancamentos(id);
            if (lancamentosAtrelados.length > 0) {
                // [4] Lançar um erro customizado com a lista de lançamentos
                const lancamentosInfo = lancamentosAtrelados.map(l => ({
                    id: l.id_lancamento,
                    descricao: l.descricao,
                    valor: l.valor
                }));
                // Lançamos uma string JSON que o Controller deve capturar
                const errorMessage = JSON.stringify({
                    message: "Não é possível excluir a conta. Lançamentos atrelados encontrados.",
                    lancamentos: lancamentosInfo
                });
                throw new Error(errorMessage);
            }
            // 2. Se não houver lançamentos, procede com a deleção
            return this.contasRepository.delete(id);
        });
    }
}
exports.ContasService = ContasService;
