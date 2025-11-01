import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags } from 'tsoa';
import { Conta, TipoConta } from '../model/Contas';
import { ContasService } from '../service/ContasService';

@Route("contas")
@Tags("Contas")
export class ContasController extends Controller {
    private contasService: ContasService;

    constructor() {
        super();
        this.contasService = new ContasService();
    }

    @Post()
    public async criarConta(
        @Body() dadosConta: {
            nome_conta: string;
            tipo_conta: TipoConta;
            codigo_conta: string;
            subtipo_conta?: string;
            subtipo_secundario?: string;
        },
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<Conta | void> {
        try {
            const novaConta = new Conta(
                0,
                dadosConta.nome_conta,
                dadosConta.tipo_conta,
                dadosConta.id_empresa,
                dadosConta.subtipo_conta,
                dadosConta.subtipo_secundario,
            );
            this.setStatus(201); // Created
            return this.contasService.criarConta(novaConta);
        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    @Get()
    public async listarContas(): Promise<Conta[]> {
        return this.contasService.listarContas();
    }

    @Get("{id}")
    public async buscarContaPorId(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Conta | void> {
        const conta = await this.contasService.buscarContaPorId(id);
        if (!conta) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }
        return conta;
    }

    @Put("{id}")
    public async atualizarConta(
        @Path() id: number,
        @Body() dadosAtualizados: Partial<{
            nome_conta: string;
            tipo_conta: TipoConta;
            codigo_conta: string;
            subtipo_conta?: string;
            subtipo_secundario?: string;
        }>,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<Conta | void> {
        try {
            const contaAtualizada = await this.contasService.atualizarConta(id, dadosAtualizados);
            if (!contaAtualizada) {
                return notFoundResponse(404, { message: "Conta não encontrada." });
            }
            return contaAtualizada;
        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    @Delete("{id}")
    public async deletarConta(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<void> {
        const deletado = await this.contasService.deletarConta(id);
        if (!deletado) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }
        this.setStatus(204);
    }
}