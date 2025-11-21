import { Controller, Get, Post, Put, Delete, Route, Body, Path, TsoaResponse, Res, Tags, Inject } from 'tsoa';
import { Usuario } from '../model/Usuario';
import { UsuarioService } from '../service/UsuarioService';
import { UsuarioRepository } from '../repository/UsuarioRepository';

@Route("usuarios")
@Tags("Usuários")
export class UsuarioController extends Controller {
    private usuarioService: UsuarioService;

    constructor() {
        super();
        this.usuarioService = new UsuarioService(UsuarioRepository.getInstance());

    }

    @Post("signup")
    public async criarUsuario(
        @Body() body: {
            nome: string;
            email: string;
            senha: string;
            // CORREÇÃO: Espera id_empresa no body
            id_empresa: number;
        },
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<Usuario | void> {
        try {
            this.setStatus(201);
            // CORREÇÃO: Passa body.id_empresa para o serviço
            const usuarioCriado = await this.usuarioService.criarUsuarioComSenha(
                body.nome,
                body.email,
                body.senha,
                body.id_empresa
            );
            const { senha, ...usuarioSeguro } = usuarioCriado;
            return usuarioSeguro as Usuario;

        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    @Post("login")
    public async signInWithPassword(
        @Body() body: {
            email: string;
            senha: string;
        },
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<{ token: string, user: any } | void> {
        try {
            this.setStatus(200);
            // CORREÇÃO: Chama o novo método signInWithPassword
            const { token, usuario } = await this.usuarioService.signInWithPassword(
                body.email,
                body.senha
            );

            return {
                token,
                user: {
                    id: usuario.id_usuario,
                    nome: usuario.nome,
                    email: usuario.email,
                    id_empresa: usuario.id_empresa
                }
            };
        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }

    @Get()
    public async listarUsuarios(
        @Inject() id_empresa: number // ID da empresa vindo do contexto (token JWT)
    ): Promise<Usuario[]> {
        return this.usuarioService.listarUsuarios(id_empresa);
    }

    @Get("{id}")
    public async buscarUsuarioPorId(
        @Path() id: number,
        @Inject() id_empresa: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<Usuario | void> {

        const usuario = await this.usuarioService.buscarUsuarioPorId(id, id_empresa);

        if (!usuario) {
            return notFoundResponse(404, { message: "Usuário não encontrado na sua empresa." });
        }
        return usuario;
    }

    @Put("{id}")
    public async atualizarDadosUsuario(
        @Path() id: number,
        @Inject() id_empresa: number,
        @Body() dadosAtualizados: Partial<Usuario>, // Partial permite atualização parcial
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
        @Res() badRequestResponse: TsoaResponse<400, { message: string }>
    ): Promise<Usuario | void> {
        try {

            dadosAtualizados.id_usuario = id;
            dadosAtualizados.id_empresa = id_empresa;
            const usuarioExistente = await this.usuarioService.buscarUsuarioPorId(id, id_empresa);

            if (!usuarioExistente) {
                return notFoundResponse(404, { message: "Usuário não encontrado na sua empresa." });
            }
            const usuarioParaAtualizar = new Usuario(
                usuarioExistente.id_usuario,
                dadosAtualizados.nome || usuarioExistente.nome,
                dadosAtualizados.email || usuarioExistente.email,
                id_empresa, // Força o ID da empresa do contexto
                usuarioExistente.senha,
            );

            const usuarioAtualizado = await this.usuarioService.atualizarDadosUsuario(usuarioParaAtualizar, id_empresa);

            if (!usuarioAtualizado) {
                return notFoundResponse(404, { message: "Falha ao atualizar o usuário." });
            }
            return usuarioAtualizado;

        } catch (error: any) {
            return badRequestResponse(400, { message: error.message });
        }
    }


    @Delete("{id}")
    public async deletarUsuario(
        @Path() id: number,
        @Inject() id_empresa: number,
        @Res() notFoundResponse: TsoaResponse<404, { message: string }>
    ): Promise<void> {
        // O Service aplica o filtro de segurança id_empresa
        const deletado = await this.usuarioService.deletarUsuario(id, id_empresa);

        if (!deletado) {
            return notFoundResponse(404, { message: "Usuário não encontrado ou acesso negado." });
        }
        this.setStatus(204); // No Content
    }
}