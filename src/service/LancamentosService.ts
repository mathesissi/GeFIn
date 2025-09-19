import { Lancamento } from '../model/Lancamento';
import { LancamentosRepository } from '../repository/LancamentosRepository';

export class LancamentosService {
  private lancamentosRepository: LancamentosRepository;
  
  constructor() {
    this.lancamentosRepository = new LancamentosRepository();
  }
  
  public async criarLancamento(dadosLancamento: any): Promise<Lancamento> {
    if (dadosLancamento.valor <= 0) {
      throw new Error('O valor do lançamento deve ser maior que zero.');
    }
    
    const novoLancamento = new Lancamento(
      '', 
      new Date(dadosLancamento.data),
      dadosLancamento.descricao,
      dadosLancamento.valor,
      dadosLancamento.id_conta_debito,
      dadosLancamento.id_conta_credito
    );
    
    const lancamentoSalvo = await this.lancamentosRepository.Create(novoLancamento);
    return lancamentoSalvo;
  }
  
  public async buscarLancamentoPorId(id: string): Promise<Lancamento | undefined> {
    return this.lancamentosRepository.Select(id);
  }
  
  public async listarLancamentos(): Promise<Lancamento[]> {
    return this.lancamentosRepository.SelectAll();
  }

  /**
   * Valida e atualiza um lançamento.
   * @param id O ID do lançamento a ser atualizado.
   * @param dadosAtualizados Os dados a serem alterados.
   * @returns O lançamento atualizado.
   * @throws Um erro se o lançamento não for encontrado ou a validação falhar.
   */
  public async atualizarLancamento(id: string, dadosAtualizados: any): Promise<Lancamento | null> {
    const lancamentoExistente = await this.lancamentosRepository.Select(id);
    
    if (!lancamentoExistente) {
      return null;
    }

    // Exemplo de lógica de validação no Service
    if (dadosAtualizados.valor && dadosAtualizados.valor <= 0) {
      throw new Error('O valor atualizado deve ser maior que zero.');
    }
    
    // Atualiza apenas os campos que foram enviados
    lancamentoExistente.data = dadosAtualizados.data || lancamentoExistente.data;
    lancamentoExistente.descricao = dadosAtualizados.descricao || lancamentoExistente.descricao;
    lancamentoExistente.valor = dadosAtualizados.valor || lancamentoExistente.valor;
    lancamentoExistente.id_conta_debito = dadosAtualizados.id_conta_debito || lancamentoExistente.id_conta_debito;
    lancamentoExistente.id_conta_credito = dadosAtualizados.id_conta_credito || lancamentoExistente.id_conta_credito;
    
    const lancamentoAtualizado = await this.lancamentosRepository.Update(lancamentoExistente);
    return lancamentoAtualizado;
  }

  /**
   * Deleta um lançamento após validações.
   * @param id O ID do lançamento a ser deletado.
   * @returns True se a deleção foi bem-sucedida.
   * @throws Um erro se o lançamento não puder ser deletado (ex: já conciliado).
   */
  public async deletarLancamento(id: string): Promise<boolean> {
    const lancamentoExistente = await this.lancamentosRepository.Select(id);

    if (!lancamentoExistente) {
      // Retorna false em vez de lançar um erro, pois a não existência não é uma falha inesperada.
      return false; 
    }

    // Exemplo de lógica de negócio no Service:
    // Poderíamos verificar aqui se o lançamento está 'conciliado'
    // if (lancamentoExistente.status === 'conciliado') {
    //   throw new Error('Não é possível deletar um lançamento já conciliado.');
    // }

    const sucesso = await this.lancamentosRepository.Delete(id);
    return sucesso;
  }
}