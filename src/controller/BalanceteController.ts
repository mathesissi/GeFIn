// src/controller/BalanceteController.ts
import { Controller, Get, Route, Query, Response, Tags, Request, TsoaResponse, SuccessResponse, Res, Security } from 'tsoa'; // Adicione Security e Request
import { BalanceteService } from '../service/BalanceteService';
import * as express from 'express';

interface BalanceteReport {
  mes: number;
  ano: number;
  contas: any[];
  total_debitos: number;
  total_creditos: number;
}

@Route("balancete")
@Tags("Balancete")
export class BalanceteController extends Controller {
  private service: BalanceteService;

  constructor() {
    super();
    this.service = new BalanceteService();
  }

  @Get()
  @Security("jwt") // Garante que o usuário está logado e request.user existe
  @SuccessResponse(200, "OK")
  @Response(400, "Requisição Inválida")
  @Response(500, "Erro Interno do Servidor")
  public async getBalancete(
    @Query() mes: number,
    @Query() ano: number,

    // CORREÇÃO: Pegar o request inteiro em vez de injetar id_empresa
    @Request() request: express.Request,

    @Res() badRequestResponse: TsoaResponse<400, { message: string }>
  ): Promise<BalanceteReport | void> {

    if (!mes || !ano) {
      return badRequestResponse(400, { message: 'Mês e Ano são obrigatórios.' });
    }

    // Extrai o ID da empresa do usuário logado (populado pelo middleware JWT)
    const user = (request as any).user;
    const id_empresa = user?.id_empresa;

    if (!id_empresa) {
      // Se cair aqui, verifique se o @Security está configurado corretamente no seu authentication.ts
      this.setStatus(401);
      throw new Error("Usuário não autenticado ou sem empresa vinculada.");
    }

    try {
      const balancete = await this.service.getBalancete(mes, ano, id_empresa);
      return balancete;

    } catch (error: any) {
      this.setStatus(500);
      return { message: 'Erro ao buscar balancete: ' + error.message } as any;
    }
  }
}