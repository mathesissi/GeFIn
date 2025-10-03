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
    criarConta(conta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!conta.nome_conta || !conta.codigo_conta || !conta.tipo_conta) {
                throw new Error("Nome, código e tipo da conta são obrigatórios.");
            }
            if (!Object.values(Contas_1.TipoConta).includes(conta.tipo_conta)) {
                throw new Error(`Tipo de conta inválido: "${conta.tipo_conta}"`);
            }
            const contaExistente = yield this.contasRepository.findByCodigoConta(conta.codigo_conta);
            if (contaExistente) {
                throw new Error(`Já existe uma conta com o código "${conta.codigo_conta}".`);
            }
            return this.contasRepository.create(conta);
        });
    }
    buscarContaPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID da conta deve ser um número inteiro positivo.');
            }
            return this.contasRepository.findById(id);
        });
    }
    listarContas() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contasRepository.findAll();
        });
    }
    atualizarConta(id, dadosAtualizados) {
        return __awaiter(this, void 0, void 0, function* () {
            const contaExistente = yield this.contasRepository.findById(id);
            if (!contaExistente) {
                return null;
            }
            const contaAtualizada = Object.assign({}, contaExistente, dadosAtualizados);
            const tipoAtualizado = contaAtualizada.tipo_conta;
            const tipoSemSubtipo = [Contas_1.TipoConta.Receita, Contas_1.TipoConta.Despesa].includes(tipoAtualizado);
            if (tipoSemSubtipo && !dadosAtualizados.hasOwnProperty('subtipo_conta')) {
                contaAtualizada.subtipo_conta = undefined;
            }
            const contaParaAtualizar = new Contas_1.Conta(contaAtualizada.id_conta, contaAtualizada.nome_conta, contaAtualizada.tipo_conta, contaAtualizada.codigo_conta, contaAtualizada.subtipo_conta, contaAtualizada.subtipo_secundario // CORREÇÃO: Adicionado o 6º argumento
            );
            return this.contasRepository.update(contaParaAtualizar);
        });
    }
    deletarConta(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('O ID da conta para deleção é inválido.');
            }
            const lancamentosAtrelados = yield this.lancamentosRepository.findLinkedLancamentos(id);
            if (lancamentosAtrelados.length > 0) {
                const lancamentosInfo = lancamentosAtrelados.map(l => ({
                    id: l.id_lancamento,
                    descricao: l.descricao,
                    valor: l.valor
                }));
                const errorMessage = "Não é possível excluir a conta. Lançamentos atrelados encontrados.";
                throw new Error(errorMessage);
            }
            return this.contasRepository.delete(id);
        });
    }
}
exports.ContasService = ContasService;
