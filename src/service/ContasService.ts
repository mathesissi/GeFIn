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

    /**
     * Cria uma nova conta, com validações de dados antes de persistir.
     * @param conta Objeto Conta a ser inserido.
     * @returns A conta criada.
     */
    public async criarConta(conta: Conta): Promise<Conta> {
        if (!conta.nome_conta || !conta.codigo_conta || !conta.tipo_conta) {
            throw new Error("Nome, código e tipo da conta são obrigatórios.");
        }
        if (!Object.values(TipoConta).includes(conta.tipo_conta)) {
            throw new Error(`Tipo de conta inválido: "${conta.tipo_conta}"`);
        }

        // A validação de subtipo já é realizada no construtor do modelo 'Conta'
        return this.contasRepository.create(conta);
    }

    /**
     * Busca uma conta pelo ID.
     * @param id O ID da conta.
     * @returns A conta encontrada ou `null` se não existir.
     */
    public async buscarContaPorId(id: number): Promise<Conta | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID da conta deve ser um número inteiro positivo.');
        }
        return this.contasRepository.findById(id);
    }

    /**
     * Lista todas as contas.
     * @returns Uma lista de todas as contas.
     */
    public async listarContas(): Promise<Conta[]> {
        return this.contasRepository.findAll();
    }

    /**
     * Atualiza uma conta com os dados fornecidos.
     * @param id O ID da conta a ser atualizada.
     * @param dadosAtualizados Objeto com os dados para atualizar a conta.
     * @returns A conta atualizada ou `null` se a conta não for encontrada.
     */
    public async atualizarConta(id: number, dadosAtualizados: Partial<Conta>): Promise<Conta | null> {
        const contaExistente = await this.contasRepository.findById(id);
        if (!contaExistente) {
            return null; // Ou lançar um erro, dependendo da regra de negócio
        }

        const contaAtualizada = Object.assign(contaExistente, dadosAtualizados);

        // Revalida a entidade atualizada
        const contaParaAtualizar = new Conta(
            contaAtualizada.id_conta,
            contaAtualizada.nome_conta,
            contaAtualizada.tipo_conta,
            contaAtualizada.codigo_conta,
            contaAtualizada.subtipo_conta
        );

        return this.contasRepository.update(contaParaAtualizar);
    }

/**
     * Deleta uma conta pelo ID, validando se há lançamentos atrelados.
     * @param id O ID da conta a ser deletada.
     * @returns `true` se a deleção foi bem-sucedida.
     * @throws {Error} Se o ID for inválido ou se houver lançamentos atrelados.
     */
    public async deletarConta(id: number): Promise<boolean> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID da conta para deleção é inválido.');
        }
        
        // 1. Verificar se há lançamentos atrelados
        const lancamentosAtrelados = await this.lancamentosRepository.findLinkedLancamentos(id);

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
    }
}