"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const UsuarioController_1 = require("./../controller/UsuarioController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const LivroRazaoController_1 = require("./../controller/LivroRazaoController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const LivroDiarioController_1 = require("./../controller/LivroDiarioController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const LancamentosController_1 = require("./../controller/LancamentosController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const IndicadoresController_1 = require("./../controller/IndicadoresController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const EmpresaController_1 = require("./../controller/EmpresaController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const DREController_1 = require("./../controller/DREController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const ContasController_1 = require("./../controller/ContasController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const BalancoPatrimonialController_1 = require("./../controller/BalancoPatrimonialController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const BalanceteController_1 = require("./../controller/BalanceteController");
const authentication_1 = require("./../authentication");
const expressAuthenticationRecasted = authentication_1.expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "Usuario": {
        "dataType": "refObject",
        "properties": {
            "id_usuario": { "dataType": "double", "required": true },
            "nome": { "dataType": "string", "required": true },
            "email": { "dataType": "string", "required": true },
            "senha": { "dataType": "string" },
            "id_empresa": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Usuario_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id_usuario": { "dataType": "double" }, "nome": { "dataType": "string" }, "email": { "dataType": "string" }, "senha": { "dataType": "string" }, "id_empresa": { "dataType": "double" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoPartida": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["debito"] }, { "dataType": "enum", "enums": ["credito"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partida": {
        "dataType": "refObject",
        "properties": {
            "id_conta": { "dataType": "double", "required": true },
            "tipo_partida": { "ref": "TipoPartida", "required": true },
            "valor": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lancamento": {
        "dataType": "refObject",
        "properties": {
            "id_lancamento": { "dataType": "double", "required": true },
            "data": { "dataType": "datetime", "required": true },
            "descricao": { "dataType": "string", "required": true },
            "valor_total": { "dataType": "double", "required": true },
            "partidas": { "dataType": "array", "array": { "dataType": "refObject", "ref": "Partida" }, "required": true },
            "id_empresa": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DadosTransacao": {
        "dataType": "refObject",
        "properties": {
            "data": { "dataType": "string", "required": true },
            "descricao": { "dataType": "string", "required": true },
            "partidas": { "dataType": "array", "array": { "dataType": "refObject", "ref": "Partida" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Empresa": {
        "dataType": "refObject",
        "properties": {
            "id_empresa": { "dataType": "double", "required": true },
            "razao_social": { "dataType": "string", "required": true },
            "cnpj": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DRELine": {
        "dataType": "refObject",
        "properties": {
            "codigo": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "descricao": { "dataType": "string", "required": true },
            "valor": { "dataType": "double", "required": true },
            "tipo": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["conta"] }, { "dataType": "enum", "enums": ["subtotal"] }, { "dataType": "enum", "enums": ["calculo"] }, { "dataType": "enum", "enums": ["titulo"] }], "required": true },
            "children": { "dataType": "array", "array": { "dataType": "refObject", "ref": "DRELine" }, "required": true },
            "nivel": { "dataType": "double", "required": true },
            "analiseVertical": { "dataType": "double" },
            "analiseHorizontal": { "dataType": "double" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DRE": {
        "dataType": "refObject",
        "properties": {
            "mes": { "dataType": "double", "required": true },
            "ano": { "dataType": "double", "required": true },
            "root": { "ref": "DRELine", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoConta": {
        "dataType": "refEnum",
        "enums": ["Ativo", "Passivo", "PatrimonioLiquido", "Receita", "Despesa"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Conta": {
        "dataType": "refObject",
        "properties": {
            "id_conta": { "dataType": "double", "required": true },
            "nome_conta": { "dataType": "string", "required": true },
            "tipo_conta": { "ref": "TipoConta", "required": true },
            "subtipo_conta": { "dataType": "string" },
            "subtipo_secundario": { "dataType": "string" },
            "codigo_conta": { "dataType": "string", "required": true },
            "id_empresa": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial__nome_conta-string--tipo_conta-TipoConta--codigo_conta-string--subtipo_conta_63_-string--subtipo_secundario_63_-string__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "nome_conta": { "dataType": "string" }, "tipo_conta": { "ref": "TipoConta" }, "codigo_conta": { "dataType": "string" }, "subtipo_conta": { "dataType": "string" }, "subtipo_secundario": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BalancoLine": {
        "dataType": "refObject",
        "properties": {
            "codigo_conta": { "dataType": "string", "required": true },
            "nome_conta": { "dataType": "string", "required": true },
            "saldo_atual": { "dataType": "double", "required": true },
            "tipo": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["grupo"] }, { "dataType": "enum", "enums": ["conta"] }, { "dataType": "enum", "enums": ["total"] }], "required": true },
            "nivel": { "dataType": "double", "required": true },
            "children": { "dataType": "array", "array": { "dataType": "refObject", "ref": "BalancoLine" }, "required": true },
            "natureza": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BalancoPatrimonialReport": {
        "dataType": "refObject",
        "properties": {
            "mes": { "dataType": "double", "required": true },
            "ano": { "dataType": "double", "required": true },
            "ativo": { "ref": "BalancoLine", "required": true },
            "passivo": { "ref": "BalancoLine", "required": true },
            "patrimonioLiquido": { "ref": "BalancoLine", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BalanceteReport": {
        "dataType": "refObject",
        "properties": {
            "mes": { "dataType": "double", "required": true },
            "ano": { "dataType": "double", "required": true },
            "contas": { "dataType": "array", "array": { "dataType": "any" }, "required": true },
            "total_debitos": { "dataType": "double", "required": true },
            "total_creditos": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsUsuarioController_criarUsuario = {
        body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "id_empresa": { "dataType": "double", "required": true }, "senha": { "dataType": "string", "required": true }, "email": { "dataType": "string", "required": true }, "nome": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/usuarios/signup', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.criarUsuario)), async function UsuarioController_criarUsuario(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_criarUsuario, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'criarUsuario',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_signInWithPassword = {
        body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "senha": { "dataType": "string", "required": true }, "email": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/usuarios/login', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.signInWithPassword)), async function UsuarioController_signInWithPassword(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_signInWithPassword, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'signInWithPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_listarUsuarios = {};
    app.get('/usuarios', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.listarUsuarios)), async function UsuarioController_listarUsuarios(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_listarUsuarios, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'listarUsuarios',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_buscarUsuarioPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.buscarUsuarioPorId)), async function UsuarioController_buscarUsuarioPorId(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_buscarUsuarioPorId, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'buscarUsuarioPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_atualizarDadosUsuario = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        dadosAtualizados: { "in": "body", "name": "dadosAtualizados", "required": true, "ref": "Partial_Usuario_" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.put('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.atualizarDadosUsuario)), async function UsuarioController_atualizarDadosUsuario(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_atualizarDadosUsuario, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'atualizarDadosUsuario',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_deletarUsuario = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.delete('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.deletarUsuario)), async function UsuarioController_deletarUsuario(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_deletarUsuario, request, response });
            const controller = new UsuarioController_1.UsuarioController();
            await templateService.apiHandler({
                methodName: 'deletarUsuario',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLivroRazaoController_getLivroRazao = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/livro-razao', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LivroRazaoController_1.LivroRazaoController)), ...((0, runtime_1.fetchMiddlewares)(LivroRazaoController_1.LivroRazaoController.prototype.getLivroRazao)), async function LivroRazaoController_getLivroRazao(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLivroRazaoController_getLivroRazao, request, response });
            const controller = new LivroRazaoController_1.LivroRazaoController();
            await templateService.apiHandler({
                methodName: 'getLivroRazao',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLivroDiarioController_getLivroDiario = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.get('/livro-diario', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LivroDiarioController_1.LivroDiarioController)), ...((0, runtime_1.fetchMiddlewares)(LivroDiarioController_1.LivroDiarioController.prototype.getLivroDiario)), async function LivroDiarioController_getLivroDiario(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLivroDiarioController_getLivroDiario, request, response });
            const controller = new LivroDiarioController_1.LivroDiarioController();
            await templateService.apiHandler({
                methodName: 'getLivroDiario',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_criarLancamento = {
        dadosTransacao: { "in": "body", "name": "dadosTransacao", "required": true, "ref": "DadosTransacao" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/lancamentos', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.criarLancamento)), async function LancamentosController_criarLancamento(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_criarLancamento, request, response });
            const controller = new LancamentosController_1.LancamentosController();
            await templateService.apiHandler({
                methodName: 'criarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_listarLancamentos = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.get('/lancamentos', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.listarLancamentos)), async function LancamentosController_listarLancamentos(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_listarLancamentos, request, response });
            const controller = new LancamentosController_1.LancamentosController();
            await templateService.apiHandler({
                methodName: 'listarLancamentos',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_buscarLancamentoPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/lancamentos/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.buscarLancamentoPorId)), async function LancamentosController_buscarLancamentoPorId(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_buscarLancamentoPorId, request, response });
            const controller = new LancamentosController_1.LancamentosController();
            await templateService.apiHandler({
                methodName: 'buscarLancamentoPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_atualizarLancamento = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        dadosAtualizados: { "in": "body", "name": "dadosAtualizados", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "partidas": { "dataType": "array", "array": { "dataType": "refObject", "ref": "Partida" } }, "descricao": { "dataType": "string" }, "data": { "dataType": "string" } } },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.put('/lancamentos/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.atualizarLancamento)), async function LancamentosController_atualizarLancamento(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_atualizarLancamento, request, response });
            const controller = new LancamentosController_1.LancamentosController();
            await templateService.apiHandler({
                methodName: 'atualizarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_deletarLancamento = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.delete('/lancamentos/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.deletarLancamento)), async function LancamentosController_deletarLancamento(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_deletarLancamento, request, response });
            const controller = new LancamentosController_1.LancamentosController();
            await templateService.apiHandler({
                methodName: 'deletarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsIndicadoresController_getIndicadores = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.get('/indicadores', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(IndicadoresController_1.IndicadoresController)), ...((0, runtime_1.fetchMiddlewares)(IndicadoresController_1.IndicadoresController.prototype.getIndicadores)), async function IndicadoresController_getIndicadores(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsIndicadoresController_getIndicadores, request, response });
            const controller = new IndicadoresController_1.IndicadoresController();
            await templateService.apiHandler({
                methodName: 'getIndicadores',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmpresaController_criarEmpresa = {
        dadosEmpresa: { "in": "body", "name": "dadosEmpresa", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "cnpj": { "dataType": "string", "required": true }, "razao_social": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/empresas', ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController)), ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController.prototype.criarEmpresa)), async function EmpresaController_criarEmpresa(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEmpresaController_criarEmpresa, request, response });
            const controller = new EmpresaController_1.EmpresaController();
            await templateService.apiHandler({
                methodName: 'criarEmpresa',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmpresaController_buscarEmpresaPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/empresas/:id', ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController)), ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController.prototype.buscarEmpresaPorId)), async function EmpresaController_buscarEmpresaPorId(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEmpresaController_buscarEmpresaPorId, request, response });
            const controller = new EmpresaController_1.EmpresaController();
            await templateService.apiHandler({
                methodName: 'buscarEmpresaPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmpresaController_buscarEmpresaPorCnpj = {
        cnpj: { "in": "path", "name": "cnpj", "required": true, "dataType": "string" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/empresas/cnpj/:cnpj', ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController)), ...((0, runtime_1.fetchMiddlewares)(EmpresaController_1.EmpresaController.prototype.buscarEmpresaPorCnpj)), async function EmpresaController_buscarEmpresaPorCnpj(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEmpresaController_buscarEmpresaPorCnpj, request, response });
            const controller = new EmpresaController_1.EmpresaController();
            await templateService.apiHandler({
                methodName: 'buscarEmpresaPorCnpj',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsDREController_getDRE = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/dre', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(DREController_1.DREController)), ...((0, runtime_1.fetchMiddlewares)(DREController_1.DREController.prototype.getDRE)), async function DREController_getDRE(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsDREController_getDRE, request, response });
            const controller = new DREController_1.DREController();
            await templateService.apiHandler({
                methodName: 'getDRE',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_criarConta = {
        dadosConta: { "in": "body", "name": "dadosConta", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "subtipo_secundario": { "dataType": "string" }, "subtipo_conta": { "dataType": "string" }, "codigo_conta": { "dataType": "string", "required": true }, "id_empresa": { "dataType": "double", "required": true }, "tipo_conta": { "ref": "TipoConta", "required": true }, "nome_conta": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/contas', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.criarConta)), async function ContasController_criarConta(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsContasController_criarConta, request, response });
            const controller = new ContasController_1.ContasController();
            await templateService.apiHandler({
                methodName: 'criarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_listarContas = {
        id_empresa: { "in": "path", "name": "id_empresa", "required": true, "dataType": "double" },
    };
    app.get('/contas/:id_empresa', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.listarContas)), async function ContasController_listarContas(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsContasController_listarContas, request, response });
            const controller = new ContasController_1.ContasController();
            await templateService.apiHandler({
                methodName: 'listarContas',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_buscarContaPorId = {
        id_empresa: { "in": "path", "name": "id_empresa", "required": true, "dataType": "double" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/contas/:id_empresa/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.buscarContaPorId)), async function ContasController_buscarContaPorId(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsContasController_buscarContaPorId, request, response });
            const controller = new ContasController_1.ContasController();
            await templateService.apiHandler({
                methodName: 'buscarContaPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_atualizarConta = {
        id_empresa: { "in": "path", "name": "id_empresa", "required": true, "dataType": "double" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        dadosAtualizados: { "in": "body", "name": "dadosAtualizados", "required": true, "ref": "Partial__nome_conta-string--tipo_conta-TipoConta--codigo_conta-string--subtipo_conta_63_-string--subtipo_secundario_63_-string__" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.put('/contas/:id_empresa/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.atualizarConta)), async function ContasController_atualizarConta(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsContasController_atualizarConta, request, response });
            const controller = new ContasController_1.ContasController();
            await templateService.apiHandler({
                methodName: 'atualizarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_deletarConta = {
        id_empresa: { "in": "path", "name": "id_empresa", "required": true, "dataType": "double" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.delete('/contas/:id_empresa/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.deletarConta)), async function ContasController_deletarConta(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsContasController_deletarConta, request, response });
            const controller = new ContasController_1.ContasController();
            await templateService.apiHandler({
                methodName: 'deletarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBalancoPatrimonialController_getBalancoPatrimonial = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.get('/balanco-patrimonial', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(BalancoPatrimonialController_1.BalancoPatrimonialController)), ...((0, runtime_1.fetchMiddlewares)(BalancoPatrimonialController_1.BalancoPatrimonialController.prototype.getBalancoPatrimonial)), async function BalancoPatrimonialController_getBalancoPatrimonial(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBalancoPatrimonialController_getBalancoPatrimonial, request, response });
            const controller = new BalancoPatrimonialController_1.BalancoPatrimonialController();
            await templateService.apiHandler({
                methodName: 'getBalancoPatrimonial',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBalanceteController_getBalancete = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/balancete', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(BalanceteController_1.BalanceteController)), ...((0, runtime_1.fetchMiddlewares)(BalanceteController_1.BalanceteController.prototype.getBalancete)), async function BalanceteController_getBalancete(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBalanceteController_getBalancete, request, response });
            const controller = new BalanceteController_1.BalanceteController();
            await templateService.apiHandler({
                methodName: 'getBalancete',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
