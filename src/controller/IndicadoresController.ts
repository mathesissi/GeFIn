import { Controller, Get, Route, Query, Request, Tags, Security, Res, TsoaResponse } from 'tsoa';
import * as express from 'express';
import { IndicadoresService } from '../service/IndicadoresService';

@Route("indicadores")
@Tags("Dashboard")
export class IndicadoresController extends Controller {
    private service: IndicadoresService;

    constructor() {
        super();
        this.service = new IndicadoresService();
    }

    @Get()
    @Security("jwt")
    public async getIndicadores(
        @Query() mes: number,
        @Query() ano: number,
        @Request() request: express.Request,
    ): Promise<any> {
        const user = (request as any).user;
        return await this.service.calcular(mes, ano, user.id_empresa);
    }
}