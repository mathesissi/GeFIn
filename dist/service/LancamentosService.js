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
const ContasRepository_1 = require("../repository/ContasRepository");
class LancamentosService {
    constructor() {
        this.lancamentosRepository = LancamentosRepository_1.LancamentosRepository.getInstance();
        this.contaRepository = ContasRepository_1.ContaRepository.getInstance();
    }
    criarLancamento(dadosTransacao) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, descricao, partidas } = dadosTransacao;
            // --- Validações de Cabeçalho ---
            if (!data || !descricao || typeof descricao !== 'string' || descricao.trim() === '') {
                throw new Error("Dados incompletos: data e descrição são obrigatórios.");
            }
            if (!Array.isArray(partidas) || partidas.length < 2) {
                throw new Error('Uma transação deve ter pelo menos duas partidas (débito e crédito).');
            }
            // --- Validação de Partidas ---
            let totalDebito = 0;
            let totalCredito = 0;
            const contasUsadas = [];
            for (const partida of partidas) {
                const { id_conta, tipo_partida, valor } = partida;
                if (!id_conta || !tipo_partida || typeof valor !== 'number' || valor <= 0) {
                    throw new Error("Dados de partida inválidos: conta, tipo e valor positivo são obrigatórios para cada partida.");
                }
                if (tipo_partida === 'debito') {
                    totalDebito += valor;
                }
                else if (tipo_partida === 'credito') {
                    totalCredito += valor;
                }
                else {
                    throw new Error(`Tipo de partida inválido: "${tipo_partida}". Deve ser "debito" ou "credito".`);
                }
                // Adiciona a conta para checagem de existência, evitando duplicidade
                if (!contasUsadas.includes(id_conta)) {
                    contasUsadas.push(id_conta);
                }
            }
            // Validação do Princípio das Partidas Dobradas: Débitos = Créditos
            if (Math.abs(totalDebito - totalCredito) > 0.005 || totalDebito === 0) { // Tolerância para ponto flutuante
                throw new Error(`O total de débitos (R$ ${totalDebito.toFixed(2)}) deve ser igual ao total de créditos (R$ ${totalCredito.toFixed(2)}) e maior que zero. Diferença: R$ ${(totalDebito - totalCredito).toFixed(2)}`);
            }
            // Validação de existência de contas
            const contasExistentes = yield Promise.all(contasUsadas.map(id => this.contaRepository.findById(id)));
            const contasInvalidas = contasUsadas.filter((_, index) => !contasExistentes[index]);
            if (contasInvalidas.length > 0) {
                throw new Error(`As seguintes contas não existem: ${contasInvalidas.join(', ')}.`);
            }
            // Cria a instância do modelo de transação
            const novoLancamento = new Lancamento_1.Lancamento(0, // ID 0 para novo lançamento
            new Date(data), descricao, totalDebito, // O valor total é a soma dos débitos (ou créditos)
            partidas);
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
            // Mescla dados antigos e novos
            const dadosMesclados = {
                data: dadosAtualizados.data || lancamentoExistente.data.toISOString().split('T')[0],
                descricao: dadosAtualizados.descricao || lancamentoExistente.descricao,
                partidas: dadosAtualizados.partidas || lancamentoExistente.partidas,
            };
            // Executa a validação completa
            let totalDebito = 0;
            let totalCredito = 0;
            const contasUsadas = [];
            if (!Array.isArray(dadosMesclados.partidas) || dadosMesclados.partidas.length < 2) {
                throw new Error('Uma transação deve ter pelo menos duas partidas (débito e crédito) na atualização.');
            }
            for (const partida of dadosMesclados.partidas) {
                const { id_conta, tipo_partida, valor } = partida;
                if (!id_conta || !tipo_partida || typeof valor !== 'number' || valor <= 0) {
                    throw new Error("Dados de partida inválidos: conta, tipo e valor positivo são obrigatórios para cada partida na atualização.");
                }
                if (tipo_partida === 'debito') {
                    totalDebito += valor;
                }
                else if (tipo_partida === 'credito') {
                    totalCredito += valor;
                }
                else {
                    throw new Error(`Tipo de partida inválido: "${tipo_partida}". Deve ser "debito" ou "credito" na atualização.`);
                }
                if (!contasUsadas.includes(id_conta)) {
                    contasUsadas.push(id_conta);
                }
            }
            if (Math.abs(totalDebito - totalCredito) > 0.005) {
                throw new Error(`O total de débitos (R$ ${totalDebito.toFixed(2)}) deve ser igual ao total de créditos (R$ ${totalCredito.toFixed(2)}) na atualização.`);
            }
            const contasExistentes = yield Promise.all(contasUsadas.map(id_conta => this.contaRepository.findById(id_conta)));
            const contasInvalidas = contasUsadas.filter((_, index) => !contasExistentes[index]);
            if (contasInvalidas.length > 0) {
                throw new Error(`As seguintes contas não existem: ${contasInvalidas.join(', ')}.`);
            }
            const lancamentoParaAtualizar = new Lancamento_1.Lancamento(id, new Date(dadosMesclados.data), dadosMesclados.descricao, totalDebito, dadosMesclados.partidas);
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
