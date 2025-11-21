import { Conta, TipoConta } from "../model/Contas";
import { ContaRepository } from "../repository/ContasRepository";
import { LancamentosRepository } from "../repository/LancamentosRepository";

export class ContasService {
    private contasRepository: ContaRepository;
    private lancamentosRepository: LancamentosRepository;

    constructor() {
        this.contasRepository = ContaRepository.getInstance();
        this.lancamentosRepository = LancamentosRepository.getInstance();
    }

    public async criarConta(conta: Conta): Promise<Conta> {
        if (!conta.nome_conta || !conta.codigo_conta || !conta.tipo_conta) {
            throw new Error("Nome, código e tipo da conta são obrigatórios.");
        }
        if (!Object.values(TipoConta).includes(conta.tipo_conta)) {
            throw new Error(`Tipo de conta inválido: "${conta.tipo_conta}"`);
        }

        // CORREÇÃO: Passando conta.id_empresa para validar unicidade corretamente
        const contaExistente = await this.contasRepository.findByCodigoConta(conta.codigo_conta, conta.id_empresa);
        if (contaExistente) {
            throw new Error(`Já existe uma conta com o código "${conta.codigo_conta}" nesta empresa.`);
        }

        return this.contasRepository.create(conta);
    }
    public async buscarContaPorId(id: number, idEmpresa: number): Promise<Conta | null> {
        if (typeof id !== 'number' || id <= 0 || typeof idEmpresa !== 'number' || idEmpresa <= 0) {
            throw new Error('O ID da conta deve ser um número inteiro positivo.');
        }
        return this.contasRepository.findById(id, idEmpresa);
    }

    public async listarContas(idEmpresa: number): Promise<Conta[]> {
        return this.contasRepository.findAll(idEmpresa);
    }

    public async atualizarConta(id: number, id_empresa: number, dadosAtualizados: Partial<Conta>): Promise<Conta | null> {
        const contaExistente = await this.contasRepository.findById(id, id_empresa);
        if (!contaExistente) {
            return null;
        }
        const contaAtualizada = Object.assign({}, contaExistente, dadosAtualizados);
        const tipoAtualizado = contaAtualizada.tipo_conta as TipoConta;
        const tipoSemSubtipo = [TipoConta.Receita, TipoConta.Despesa].includes(tipoAtualizado);

        if (tipoSemSubtipo && !dadosAtualizados.hasOwnProperty('subtipo_conta')) {

            contaAtualizada.subtipo_conta = undefined;
        }

        const contaParaAtualizar = new Conta(
            contaAtualizada.id_conta,
            contaAtualizada.nome_conta,
            contaAtualizada.tipo_conta as TipoConta,
            contaAtualizada.codigo_conta,
            contaAtualizada.id_empresa,
            contaAtualizada.subtipo_conta,
            contaAtualizada.subtipo_secundario
        );

        return this.contasRepository.update(contaParaAtualizar);
    }

    public async deletarConta(id: number, id_empresa: number): Promise<boolean> {
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