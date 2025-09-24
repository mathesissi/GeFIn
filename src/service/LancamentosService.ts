import { Lancamento } from '../model/Lancamento';
import { LancamentosRepository } from '../repository/LancamentosRepository';

export class LancamentosService {
  private lancamentosRepository: LancamentosRepository;

  constructor() {
    this.lancamentosRepository = LancamentosRepository.getInstance();
  }

  /**
   * Cria um novo lançamento após validação dos dados.
   * @param dadosLancamento Objeto com os dados para criar o lançamento.
   * @returns O lançamento criado, incluindo o ID do banco de dados.
   */
  public async criarLancamento(dadosLancamento: any): Promise<Lancamento> {
    const { data, descricao, valor, id_conta_debito, id_conta_credito } = dadosLancamento;

    if (!data || !descricao || valor === undefined || !id_conta_debito || !id_conta_credito) {
      throw new Error("Dados incompletos: data, descrição, valor, conta de débito e conta de crédito são obrigatórios.");
    }
    if (typeof valor !== 'number' || valor <= 0) {
      throw new Error("O valor do lançamento deve ser um número positivo.");
    }
    if (id_conta_debito === id_conta_credito) {
      throw new Error("A conta de débito e a conta de crédito não podem ser a mesma.");
    }

    const novoLancamento = new Lancamento(
      0, // O ID será gerado pelo banco de dados
      new Date(data),
      descricao,
      valor,
      id_conta_debito,
      id_conta_credito
    );

    return this.lancamentosRepository.Create(novoLancamento);
  }

  /**
   * Busca um lançamento pelo ID.
   * @param id O ID do lançamento a ser buscado.
   * @returns O lançamento encontrado ou `null` se não existir.
   */
  public async buscarLancamentoPorId(id: number): Promise<Lancamento | null> {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
    }
    return this.lancamentosRepository.Select(id);
  }

  /**
   * Lista todos os lançamentos.
   * @returns Uma lista de todos os lançamentos.
   */
  public async listarLancamentos(): Promise<Lancamento[]> {
    return this.lancamentosRepository.findAll();
  }

  /**
   * Valida e atualiza um lançamento.
   * @param id O ID do lançamento a ser atualizado.
   * @param dadosAtualizados Os dados a serem atualizados no lançamento.
   * @returns O lançamento atualizado ou `null` se não for encontrado.
   */
  public async atualizarLancamento(id: number, dadosAtualizados: any): Promise<Lancamento | null> {
    const lancamentoExistente = await this.lancamentosRepository.Select(id);

    if (!lancamentoExistente) {
      return null;
    }

    const lancamentoParaAtualizar = new Lancamento(
      id,
      dadosAtualizados.data ? new Date(dadosAtualizados.data) : lancamentoExistente.data,
      dadosAtualizados.descricao || lancamentoExistente.descricao,
      dadosAtualizados.valor || lancamentoExistente.valor,
      dadosAtualizados.id_conta_debito || lancamentoExistente.id_conta_debito,
      dadosAtualizados.id_conta_credito || lancamentoExistente.id_conta_credito
    );

    return this.lancamentosRepository.Update(lancamentoParaAtualizar);
  }

  /**
   * Deleta um lançamento após validações.
   * @param id O ID do lançamento a ser deletado.
   * @returns `true` se a deleção foi bem-sucedida, `false` caso contrário.
   */
  public async deletarLancamento(id: number): Promise<boolean> {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
    }
    const lancamentoExistente = await this.lancamentosRepository.Select(id);
    if (!lancamentoExistente) {
      return false;
    }
    return this.lancamentosRepository.Delete(id);
  }
}