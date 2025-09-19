import { Lancamento } from '../model/Lancamento';
import { LancamentosService } from '../service/LancamentosService';

export class LancamentosController {
  private lancamentosService: LancamentosService;
  
  constructor() {
    this.lancamentosService = new LancamentosService();
  }
  
  public async criarLancamento(dadosLancamento: any): Promise<Lancamento> {
    try {
      const lancamentoCriado = await this.lancamentosService.criarLancamento(dadosLancamento);
      return lancamentoCriado;
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      throw error;
    }
  }
  
  public async listarLancamentos(): Promise<Lancamento[]> {
    return await this.lancamentosService.listarLancamentos();
  }

  public async buscarLancamentoPorId(id: string): Promise<Lancamento | undefined> {
    return await this.lancamentosService.buscarLancamentoPorId(id);
  }

  public async atualizarLancamento(id: string, dadosAtualizados: any): Promise<Lancamento | null> {
    try {
      const lancamentoAtualizado = await this.lancamentosService.atualizarLancamento(id, dadosAtualizados);
      return lancamentoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      throw error;
    }
  }

  public async deletarLancamento(id: string): Promise<boolean> {
    try {
      const sucesso = await this.lancamentosService.deletarLancamento(id);
      return sucesso;
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error);
      throw error;
    }
  }
}