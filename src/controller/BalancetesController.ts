import { BalanceteService } from '../service/BalanceteService';
import { Balancete } from '../model/balancete';
import { Controller, Route, Get, Post, Query, Body, TsoaResponse, Res, Tags } from 'tsoa';

@Route("balancetes")
@Tags("Balancetes")
export class BalancetesController extends Controller {
    private balanceteService: BalanceteService;

    constructor() {
        super();
        this.balanceteService = new BalanceteService();
    }

    @Get()
    public async getBalancetes(
        @Query() mes: number,
        @Query() ano: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Balancete[] | void> {
        const balancetes = await this.balanceteService.getBalancetePorPeriodo(mes, ano);
        if (!balancetes || balancetes.length === 0) {
            return notFoundResponse(404, { message: "Balancetes não encontrados para o período especificado." });
        }
        return balancetes;
    }

    @Post("gerar")
    public async postGerarBalancetes(
        @Body() body: { mes: number, ano: number },
        @Res() serverErrorResponse: TsoaResponse<500, { message: string }>
    ): Promise<Balancete[] | void> {
        try {
            const balancetes = await this.balanceteService.gerarBalancete(body.mes, body.ano);
            this.setStatus(201); // Created
            return balancetes;
        } catch (error: any) {
            return serverErrorResponse(500, { message: `Erro ao gerar balancetes: ${error.message}` });
        }
    }
}