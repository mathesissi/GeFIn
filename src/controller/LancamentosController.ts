import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags, Request, Security } from 'tsoa';
import { Lancamento, Partida } from '../model/Lancamento';
import { LancamentosService, DadosTransacao } from '../service/LancamentosService';
import * as express from 'express';

@Route("lancamentos")
@Tags("Lançamentos")
export class LancamentosController extends Controller {
  private lancamentosService: LancamentosService;

  constructor() {
    super();
    this.lancamentosService = new LancamentosService();
  }

  @Post()
  @Security("jwt")
  public async criarLancamento(
    @Body() dadosTransacao: DadosTransacao,
    @Request() request: express.Request, // <--- Use Request
    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<Lancamento | void> {
    try {
      const user = (request as any).user;
      const id_empresa = user.id_empresa; // <--- Extraia daqui

      this.setStatus(201);
      return this.lancamentosService.criarLancamento(dadosTransacao, id_empresa);
    } catch (error: any) {
      return badRequestResponse(400, { message: error.message });
    }
  }

  @Get()
  @Security("jwt")
  public async listarLancamentos(
    @Request() request: express.Request
  ): Promise<Lancamento[]> {
    const user = (request as any).user;
    const id_empresa = user.id_empresa;
    return this.lancamentosService.listarLancamentos(id_empresa);
  }

  @Get("{id}")
  @Security("jwt")
  public async buscarLancamentoPorId(
    @Path() id: number,
    @Request() request: express.Request,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>
  ): Promise<Lancamento | void> {
    const user = (request as any).user;
    const id_empresa = user.id_empresa;

    const lancamento = await this.lancamentosService.buscarLancamentoPorId(id, id_empresa);
    if (!lancamento) {
      return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
    }
    return lancamento;
  }

  @Put("{id}")
  @Security("jwt")
  public async atualizarLancamento(
    @Path() id: number,
    @Request() request: express.Request,
    @Body() dadosAtualizados: {
      data?: string;
      descricao?: string;
      partidas?: Partida[];
    },
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<Lancamento | void> {
    try {
      const user = (request as any).user;
      const id_empresa = user.id_empresa;

      const lancamentoAtualizado = await this.lancamentosService.atualizarLancamento(id, id_empresa, dadosAtualizados);
      if (!lancamentoAtualizado) {
        return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
      }
      return lancamentoAtualizado;
    } catch (error: any) {
      return badRequestResponse(400, { message: error.message });
    }
  }

  @Delete("{id}")
  @Security("jwt")
  public async deletarLancamento(
    @Path() id: number,
    @Request() request: express.Request,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>
  ): Promise<void> {
    const user = (request as any).user;
    const id_empresa = user.id_empresa;

    const deletado = await this.lancamentosService.deletarLancamento(id, id_empresa);
    if (!deletado) {
      return notFoundResponse(404, { message: "Lançamento não encontrado ou acesso negado." });
    }
    this.setStatus(204);
  }
}