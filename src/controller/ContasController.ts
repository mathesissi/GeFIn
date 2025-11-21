import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags } from 'tsoa';
import { Conta, TipoConta } from '../model/Contas';
import { ContasService } from '../service/ContasService';

@Route("contas")
@Tags("Contas")
export class ContasController extends Controller {
    private contasService = new ContasService();

    constructor() {
        super();
        this.contasService = new ContasService();
    }
    /** Criar Conta */
    @Post()
    public async criarConta(
        @Body() dadosConta: {
            nome_conta: string;
            tipo_conta: TipoConta;
            id_empresa: number;
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
                dadosConta.codigo_conta,
                dadosConta.id_empresa,
                dadosConta.subtipo_conta,
                dadosConta.subtipo_secundario,
            );
            this.setStatus(201);
            return this.contasService.criarConta(novaConta);
        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    /** Listar contas por empresa */
    @Get("{id_empresa}")
    public async listarContas(@Path() id_empresa: number): Promise<Conta[]> {
        return this.contasService.listarContas(id_empresa);
    }

    /** Buscar conta por id */
    @Get("{id_empresa}/{id}")
    public async buscarContaPorId(
        @Path() id_empresa: number,
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Conta | void> {
        const conta = await this.contasService.buscarContaPorId(id, id_empresa);
        if (!conta) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }
        return conta;
    }

    /** Atualizar conta */
    @Put("{id_empresa}/{id}")
    public async atualizarConta(
        @Path() id_empresa: number,
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
            const contaAtualizada = await this.contasService.atualizarConta(id, id_empresa, dadosAtualizados);
            if (!contaAtualizada) {
                return notFoundResponse(404, { message: "Conta não encontrada." });
            }
            return contaAtualizada;
        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    /** Deletar conta */
    @Delete("{id_empresa}/{id}")
    public async deletarConta(
        @Path() id_empresa: number,
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<void> {
        const deletado = await this.contasService.deletarConta(id, id_empresa);
        if (!deletado) {
            return notFoundResponse(404, { message: "Conta não encontrada." });
        }

        this.setStatus(204);
    }
}
