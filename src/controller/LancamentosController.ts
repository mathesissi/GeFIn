import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags } from 'tsoa';
import { Lancamento, Partida } from '../model/Lancamento';
import { LancamentosService, DadosTransacao } from '../service/LancamentosService';

@Route("lancamentos")
@Tags("Lançamentos")
export class LancamentosController extends Controller {
  private lancamentosService: LancamentosService;

  constructor() {
    super();
    this.lancamentosService = new LancamentosService();
  }

  @Post()
  public async criarLancamento(
    @Body() dadosTransacao: DadosTransacao, // Nova interface para dados de transação
    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<Lancamento | void> {
    try {
      this.setStatus(201); // Created
      return this.lancamentosService.criarLancamento(dadosTransacao);
    } catch (error: any) {
      // É importante garantir que a mensagem de erro seja acessível
      return badRequestResponse(400, { message: error.message });
    }
  }

  @Get()
  public async listarLancamentos(): Promise<Lancamento[]> {
    return this.lancamentosService.listarLancamentos();
  }

  @Get("{id}")
  public async buscarLancamentoPorId(
    @Path() id: number,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>
  ): Promise<Lancamento | void> {
    const lancamento = await this.lancamentosService.buscarLancamentoPorId(id);
    if (!lancamento) {
      return notFoundResponse(404, { message: "Lançamento não encontrado." });
    }
    return lancamento;
  }

  @Put("{id}")
  public async atualizarLancamento(
    @Path() id: number,
    @Body() dadosAtualizados: {
      data?: string;
      descricao?: string;
      partidas?: Partida[]; // Permite atualizar as partidas
    },
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<Lancamento | void> {
    try {
      const lancamentoAtualizado = await this.lancamentosService.atualizarLancamento(id, dadosAtualizados);
      if (!lancamentoAtualizado) {
        return notFoundResponse(404, { message: "Lançamento não encontrado." });
      }
      return lancamentoAtualizado;
    } catch (error: any) {
      return badRequestResponse(400, { message: error.message });
    }
  }

  @Delete("{id}")
  public async deletarLancamento(
    @Path() id: number,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>
  ): Promise<void> {
    const deletado = await this.lancamentosService.deletarLancamento(id);
    if (!deletado) {
      return notFoundResponse(404, { message: "Lançamento não encontrado." });
    }
    this.setStatus(204); // No Content
  }
}