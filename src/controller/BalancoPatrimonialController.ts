import { Controller, Get, Route, Query, Request, Security, Tags } from 'tsoa';
import { BalancoPatrimonialService } from '../service/BalancoPatrimonialService';
import { BalancoPatrimonialReport } from '../model/RelatoriosModel';
import * as express from 'express';

@Route("balanco-patrimonial")
@Tags("Relatórios")
export class BalancoPatrimonialController extends Controller {
    @Get()
    @Security("jwt")
    public async getBalancoPatrimonial(
        @Query() mes: number,
        @Query() ano: number,
        @Request() request: express.Request
    ): Promise<BalancoPatrimonialReport> {
        const user = (request as any).user;
        const service = new BalancoPatrimonialService();
        return await service.gerarBalanco(user.id_empresa, mes, ano);
    }
}