import { Controller, Get, Post, Route, Body, Path, TsoaResponse, Res, Tags } from 'tsoa';
import { Empresa } from '../model/Empresa';
import { EmpresaService } from '../service/EmpresaService';
import { EmpresaRepository } from '../repository/EmpresaRepository';

@Route("empresas")
@Tags("Empresas")
export class EmpresaController extends Controller {
    private empresaService: EmpresaService;

    // Injeção de Dependência (DI) via construtor
    constructor() {
        super();
        this.empresaService = new EmpresaService(EmpresaRepository.getInstance());
    }

    /**
     * Cria uma nova empresa no sistema.
     * Esta rota é geralmente restrita a administradores ou ao fluxo de cadastro inicial (Sign-up).
     */
    @Post()
    public async criarEmpresa(
        @Body() dadosEmpresa: {
            razao_social: string;
            cnpj: string;
        },
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<Empresa | void> {
        try {
            const novaEmpresa = new Empresa(0, dadosEmpresa.razao_social, dadosEmpresa.cnpj);

            this.setStatus(201); // 201 Created
            return this.empresaService.criarEmpresa(novaEmpresa);
        } catch (error: any) {
            // Retorna 400 em caso de erro de validação (ex: CNPJ já existe)
            return badRequestResponse(400, { message: error.message });
        }
    }

    /**
     * Busca uma empresa pelo ID.
     */
    @Get("{id}")
    public async buscarEmpresaPorId(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Empresa | void> {
        const empresa = await this.empresaService.buscarEmpresaPorId(id);

        if (!empresa) {
            return notFoundResponse(404, { message: "Empresa não encontrada." });
        }
        return empresa;
    }

    /**
     * Busca uma empresa pelo CNPJ.
     */
    @Get("cnpj/{cnpj}")
    public async buscarEmpresaPorCnpj(
        @Path() cnpj: string,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Empresa | void> {
        const empresa = await this.empresaService.buscarEmpresaPorCnpj(cnpj);

        if (!empresa) {
            return notFoundResponse(404, { message: "Empresa não encontrada." });
        }
        return empresa;
    }

    // Nota: O método findAll() geralmente é omitido para prevenir listagens globais
    // ou é restrito apenas a administradores globais.
}