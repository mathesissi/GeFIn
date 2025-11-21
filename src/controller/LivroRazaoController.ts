import { Controller, Get, Route, Query, Request, Tags, Security, Res, TsoaResponse } from 'tsoa';
import * as express from 'express';
import { LivroRazaoService } from '../service/LivroRazaoService';

@Route("livro-razao")
@Tags("Relatórios")
export class LivroRazaoController extends Controller {
    private service: LivroRazaoService;

    constructor() {
        super();
        this.service = new LivroRazaoService();
    }

    @Get()
    @Security("jwt")
    public async getLivroRazao(
        @Query() mes: number,
        @Query() ano: number,
        @Request() request: express.Request,
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<any> {
        if (!mes || !ano) return badRequestResponse(400, { message: "Mês e Ano obrigatórios." });

        const user = (request as any).user;
        return await this.service.gerarLivroRazao(mes, ano, user.id_empresa);
    }
}