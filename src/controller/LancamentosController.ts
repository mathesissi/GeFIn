import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags } from 'tsoa';
import { Lancamento } from '../model/Lancamento';
import { LancamentosService } from '../service/LancamentosService';

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
    @Body() dadosLancamento: {
      data: string;
      descricao: string;
      valor: number;
      id_conta_debito: number;
      id_conta_credito: number;
    },
    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<Lancamento | void> {
    try {
      this.setStatus(201); // Created
      return this.lancamentosService.criarLancamento(dadosLancamento);
    } catch (error: any) {
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
      data?: Date;
      descricao?: string;
      valor?: number;
      id_conta_debito?: number;
      id_conta_credito?: number;
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