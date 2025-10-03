import { Controller, Get, Query, Route, Tags, TsoaResponse, Res } from 'tsoa';
import { BalancoPatrimonialService, BalancoPatrimonial } from '../service/BalancoPatrimonialService';

@Route("balanco-patrimonial")
@Tags("Relatórios")
export class BalancoPatrimonialController extends Controller {
    private balancoService: BalancoPatrimonialService;

    constructor() {
        super();
        this.balancoService = new BalancoPatrimonialService();
    }

    @Get()
    public async getBalanco(
        @Query() mes: number,
        @Query() ano: number,
        @Res() serverErrorResponse: TsoaResponse<500, { message: string }>
    ): Promise<BalancoPatrimonial | void> {
        try {
            const balanco = await this.balancoService.gerarBalanco(mes, ano);
            return balanco;
        } catch (error: any) {
            return serverErrorResponse(500, { message: `Erro ao gerar o Balanço Patrimonial: ${error.message}` });
        }
    }
}