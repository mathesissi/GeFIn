import { Controller, Get, Route, Query, Request, Security, Tags } from 'tsoa';
import { LivroDiarioService } from '../service/LivroDiarioService';
import * as express from 'express';

@Route("livro-diario")
@Tags("Relatórios")
export class LivroDiarioController extends Controller {
    @Get()
    @Security("jwt")
    public async getLivroDiario(
        @Query() mes: number,
        @Query() ano: number,
        @Request() request: express.Request
    ): Promise<any> {
        const user = (request as any).user;
        const service = new LivroDiarioService();
        return await service.gerarLivroDiario(user.id_empresa, mes, ano);
    }
}