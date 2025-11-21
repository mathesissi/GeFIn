import { Controller, Get, Route, Query, Request, Tags, Security, Res, TsoaResponse } from 'tsoa';
import { DREService } from '../service/DREService';
import { DRE } from '../model/DRE';
import * as express from 'express';

@Route("dre")
@Tags("Relatórios")
export class DREController extends Controller {
    private service: DREService;

    constructor() {
        super();
        this.service = new DREService();
    }

    /**
     * Gera a Demonstração do Resultado do Exercício (DRE) para um período específico.
     */
    @Get()
    @Security("jwt")
    public async getDRE(
        @Query() mes: number,
        @Query() ano: number,
        @Request() request: express.Request,
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<DRE | void> {

        // Validação básica
        if (!mes || !ano) {
            return badRequestResponse(400, { message: "Mês e Ano são obrigatórios." });
        }

        try {
            // Extração segura do ID da empresa via Token JWT
            const user = (request as any).user;
            const id_empresa = user.id_empresa;

            if (!id_empresa) {
                this.setStatus(401);
                return badRequestResponse(400, { message: "Usuário sem empresa vinculada." });
            }

            return await this.service.gerarRelatorio(mes, ano, id_empresa);

        } catch (error: any) {
            this.setStatus(500);
            return badRequestResponse(400, { message: "Erro ao gerar DRE: " + error.message });
        }
    }
}