"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const tsoa_1 = require("tsoa");
const Usuario_1 = require("../model/Usuario");
const UsuarioService_1 = require("../service/UsuarioService");
const UsuarioRepository_1 = require("../repository/UsuarioRepository");
let UsuarioController = class UsuarioController extends tsoa_1.Controller {
    constructor() {
        super();
        this.usuarioService = new UsuarioService_1.UsuarioService(UsuarioRepository_1.UsuarioRepository.getInstance());
    }
    async criarUsuario(body, badRequestResponse) {
        try {
            this.setStatus(201);
            // CORREÇÃO: Passa body.id_empresa para o serviço
            const usuarioCriado = await this.usuarioService.criarUsuarioComSenha(body.nome, body.email, body.senha, body.id_empresa);
            const { senha, ...usuarioSeguro } = usuarioCriado;
            return usuarioSeguro;
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    async signInWithPassword(body, badRequestResponse) {
        try {
            this.setStatus(200);
            // CORREÇÃO: Chama o novo método signInWithPassword
            const { token, usuario } = await this.usuarioService.signInWithPassword(body.email, body.senha);
            return {
                token,
                user: {
                    id: usuario.id_usuario,
                    nome: usuario.nome,
                    email: usuario.email,
                    id_empresa: usuario.id_empresa
                }
            };
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    async listarUsuarios(id_empresa // ID da empresa vindo do contexto (token JWT)
    ) {
        return this.usuarioService.listarUsuarios(id_empresa);
    }
    async buscarUsuarioPorId(id, id_empresa, notFoundResponse) {
        const usuario = await this.usuarioService.buscarUsuarioPorId(id, id_empresa);
        if (!usuario) {
            return notFoundResponse(404, { message: "Usuário não encontrado na sua empresa." });
        }
        return usuario;
    }
    async atualizarDadosUsuario(id, id_empresa, dadosAtualizados, notFoundResponse, badRequestResponse) {
        try {
            dadosAtualizados.id_usuario = id;
            dadosAtualizados.id_empresa = id_empresa;
            const usuarioExistente = await this.usuarioService.buscarUsuarioPorId(id, id_empresa);
            if (!usuarioExistente) {
                return notFoundResponse(404, { message: "Usuário não encontrado na sua empresa." });
            }
            const usuarioParaAtualizar = new Usuario_1.Usuario(usuarioExistente.id_usuario, dadosAtualizados.nome || usuarioExistente.nome, dadosAtualizados.email || usuarioExistente.email, id_empresa, // Força o ID da empresa do contexto
            usuarioExistente.senha);
            const usuarioAtualizado = await this.usuarioService.atualizarDadosUsuario(usuarioParaAtualizar, id_empresa);
            if (!usuarioAtualizado) {
                return notFoundResponse(404, { message: "Falha ao atualizar o usuário." });
            }
            return usuarioAtualizado;
        }
        catch (error) {
            return badRequestResponse(400, { message: error.message });
        }
    }
    async deletarUsuario(id, id_empresa, notFoundResponse) {
        // O Service aplica o filtro de segurança id_empresa
        const deletado = await this.usuarioService.deletarUsuario(id, id_empresa);
        if (!deletado) {
            return notFoundResponse(404, { message: "Usuário não encontrado ou acesso negado." });
        }
        this.setStatus(204); // No Content
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, tsoa_1.Post)("signup"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "criarUsuario", null);
__decorate([
    (0, tsoa_1.Post)("login"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "signInWithPassword", null);
__decorate([
    (0, tsoa_1.Get)(),
    __param(0, (0, tsoa_1.Inject)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listarUsuarios", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Inject)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "buscarUsuarioPorId", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Inject)()),
    __param(2, (0, tsoa_1.Body)()),
    __param(3, (0, tsoa_1.Res)()),
    __param(4, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Function, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "atualizarDadosUsuario", null);
__decorate([
    (0, tsoa_1.Delete)("{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Inject)()),
    __param(2, (0, tsoa_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Function]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "deletarUsuario", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, tsoa_1.Route)("usuarios"),
    (0, tsoa_1.Tags)("Usuários"),
    __metadata("design:paramtypes", [])
], UsuarioController);
