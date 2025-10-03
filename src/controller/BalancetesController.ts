import { BalanceteService } from '../service/BalanceteService';
import { Controller, Route, Get, Query, Tags, TsoaResponse, Res } from 'tsoa';

@Route("balancetes")
@Tags("Relatórios")
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
        @Res() serverErrorResponse: TsoaResponse<500, { message: string }>
    ): Promise<any[] | void> {
        try {
            const balancetes = await this.balanceteService.getBalancetePorPeriodo(mes, ano);
            return balancetes;
        } catch (error: any) {
            console.error('Erro no BalancetesController:', error);
            return serverErrorResponse(500, { message: `Erro ao obter ou gerar balancetes: ${error.message}` });
        }
    }
}