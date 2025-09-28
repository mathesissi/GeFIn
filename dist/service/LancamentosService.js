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
exports.LancamentosService = void 0;
const Lancamento_1 = require("../model/Lancamento");
const LancamentosRepository_1 = require("../repository/LancamentosRepository");
class LancamentosService {
    constructor() {
        // É uma boa prática usar o padrão Singleton para o repositório.
        this.lancamentosRepository = LancamentosRepository_1.LancamentosRepository.getInstance();
    }
    /**
     * Cria um novo lançamento após validação dos dados.
     * @param dadosLancamento Objeto com os dados para criar o lançamento.
     * @returns O lançamento criado, incluindo o ID do banco de dados.
     */
    criarLancamento(dadosLancamento) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, descricao, valor, id_conta_debito, id_conta_credito } = dadosLancamento;
            // --- Validações ---
            if (!data || !descricao || valor === undefined || !id_conta_debito || !id_conta_credito) {
                throw new Error("Dados incompletos: data, descrição, valor, conta de débito e conta de crédito são obrigatórios.");
            }
            if (typeof valor !== 'number' || valor <= 0) {
                throw new Error("O valor do lançamento deve ser um número positivo.");
            }
            if (id_conta_debito === id_conta_credito) {
                throw new Error("A conta de débito e a conta de crédito não podem ser a mesma.");
            }
            // --- Criação do Objeto ---
            // O ID é 0 porque será gerado pelo banco de dados.
            const novoLancamento = new Lancamento_1.Lancamento(0, new Date(data), // Converte a string para um objeto Date
            descricao, valor, id_conta_debito, id_conta_credito);
            // Supondo que o método no repositório se chame 'criarLancamento' ou similar.
            // Ajuste se o nome for diferente (por exemplo, 'Create').
            return this.lancamentosRepository.Create(novoLancamento);
        });
    }
    /**
     * Busca um lançamento pelo ID.
     * @param id O ID do lançamento a ser buscado.
     * @returns O lançamento encontrado ou `null` se não existir.
     */
    buscarLancamentoPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
            }
            return this.lancamentosRepository.Select(id);
        });
    }
    /**
     * Lista todos os lançamentos.
     * @returns Uma lista de todos os lançamentos.
     */
    listarLancamentos() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.lancamentosRepository.findAll();
        });
    }
    /**
     * Valida e atualiza um lançamento.
     * @param id O ID do lançamento a ser atualizado.
     * @param dadosAtualizados Os dados a serem atualizados no lançamento.
     * @returns O lançamento atualizado ou `null` se não for encontrado.
     */
    atualizarLancamento(id, dadosAtualizados) {
        return __awaiter(this, void 0, void 0, function* () {
            const lancamentoExistente = yield this.lancamentosRepository.Select(id);
            if (!lancamentoExistente) {
                return null;
            }
            const lancamentoParaAtualizar = new Lancamento_1.Lancamento(id, dadosAtualizados.data ? new Date(dadosAtualizados.data) : lancamentoExistente.data, dadosAtualizados.descricao || lancamentoExistente.descricao, dadosAtualizados.valor || lancamentoExistente.valor, dadosAtualizados.id_conta_debito || lancamentoExistente.id_conta_debito, dadosAtualizados.id_conta_credito || lancamentoExistente.id_conta_credito);
            return this.lancamentosRepository.Update(lancamentoParaAtualizar);
        });
    }
    /**
     * Deleta um lançamento após validações.
     * @param id O ID do lançamento a ser deletado.
     * @returns `true` se a deleção foi bem-sucedida, `false` caso contrário.
     */
    deletarLancamento(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
            }
            const lancamentoExistente = yield this.lancamentosRepository.Select(id);
            if (!lancamentoExistente) {
                return false;
            }
            return this.lancamentosRepository.Delete(id);
        });
    }
}
exports.LancamentosService = LancamentosService;
