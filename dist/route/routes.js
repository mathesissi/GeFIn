"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const LancamentosController_1 = require("./../controller/LancamentosController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const ContasController_1 = require("./../controller/ContasController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const BalancetesController_1 = require("./../controller/BalancetesController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "Lancamento": {
        "dataType": "refObject",
        "properties": {
            "id_lancamento": { "dataType": "double", "required": true },
            "data": { "dataType": "datetime", "required": true },
            "descricao": { "dataType": "string", "required": true },
            "valor": { "dataType": "double", "required": true },
            "id_conta_debito": { "dataType": "double", "required": true },
            "id_conta_credito": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoConta": {
        "dataType": "refEnum",
        "enums": ["Ativo", "Passivo", "Patrimônio Líquido", "Receita", "Despesa"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Conta": {
        "dataType": "refObject",
        "properties": {
            "id_conta": { "dataType": "double", "required": true },
            "nome_conta": { "dataType": "string", "required": true },
            "tipo_conta": { "ref": "TipoConta", "required": true },
            "subtipo_conta": { "dataType": "string" },
            "codigo_conta": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Conta_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id_conta": { "dataType": "double" }, "nome_conta": { "dataType": "string" }, "tipo_conta": { "ref": "TipoConta" }, "subtipo_conta": { "dataType": "string" }, "codigo_conta": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Balancete": {
        "dataType": "refObject",
        "properties": {
            "id_balancete": { "dataType": "double", "required": true },
            "mes": { "dataType": "double", "required": true },
            "ano": { "dataType": "double", "required": true },
            "id_conta": { "dataType": "double", "required": true },
            "saldo_inicial": { "dataType": "double", "required": true },
            "saldo_final": { "dataType": "double", "required": true },
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
    const argsLancamentosController_criarLancamento = {
        dadosLancamento: { "in": "body", "name": "dadosLancamento", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "id_conta_credito": { "dataType": "double", "required": true }, "id_conta_debito": { "dataType": "double", "required": true }, "valor": { "dataType": "double", "required": true }, "descricao": { "dataType": "string", "required": true }, "data": { "dataType": "datetime", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/lancamentos', ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.criarLancamento)), function LancamentosController_criarLancamento(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_criarLancamento, request, response });
                const controller = new LancamentosController_1.LancamentosController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_listarLancamentos = {};
    app.get('/lancamentos', ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.listarLancamentos)), function LancamentosController_listarLancamentos(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_listarLancamentos, request, response });
                const controller = new LancamentosController_1.LancamentosController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_buscarLancamentoPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/lancamentos/:id', ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.buscarLancamentoPorId)), function LancamentosController_buscarLancamentoPorId(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_buscarLancamentoPorId, request, response });
                const controller = new LancamentosController_1.LancamentosController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_atualizarLancamento = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        dadosAtualizados: { "in": "body", "name": "dadosAtualizados", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "id_conta_credito": { "dataType": "double" }, "id_conta_debito": { "dataType": "double" }, "valor": { "dataType": "double" }, "descricao": { "dataType": "string" }, "data": { "dataType": "datetime" } } },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.put('/lancamentos/:id', ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.atualizarLancamento)), function LancamentosController_atualizarLancamento(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_atualizarLancamento, request, response });
                const controller = new LancamentosController_1.LancamentosController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLancamentosController_deletarLancamento = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.delete('/lancamentos/:id', ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController)), ...((0, runtime_1.fetchMiddlewares)(LancamentosController_1.LancamentosController.prototype.deletarLancamento)), function LancamentosController_deletarLancamento(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_deletarLancamento, request, response });
                const controller = new LancamentosController_1.LancamentosController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_criarConta = {
        dadosConta: { "in": "body", "name": "dadosConta", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "subtipo_conta": { "dataType": "string" }, "codigo_conta": { "dataType": "string", "required": true }, "tipo_conta": { "ref": "TipoConta", "required": true }, "nome_conta": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/contas', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.criarConta)), function ContasController_criarConta(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_criarConta, request, response });
                const controller = new ContasController_1.ContasController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_listarContas = {};
    app.get('/contas', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.listarContas)), function ContasController_listarContas(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_listarContas, request, response });
                const controller = new ContasController_1.ContasController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_buscarContaPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/contas/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.buscarContaPorId)), function ContasController_buscarContaPorId(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_buscarContaPorId, request, response });
                const controller = new ContasController_1.ContasController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_atualizarConta = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        dadosAtualizados: { "in": "body", "name": "dadosAtualizados", "required": true, "ref": "Partial_Conta_" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
        badRequestResponse: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.put('/contas/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.atualizarConta)), function ContasController_atualizarConta(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_atualizarConta, request, response });
                const controller = new ContasController_1.ContasController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsContasController_deletarConta = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.delete('/contas/:id', ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController)), ...((0, runtime_1.fetchMiddlewares)(ContasController_1.ContasController.prototype.deletarConta)), function ContasController_deletarConta(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_deletarConta, request, response });
                const controller = new ContasController_1.ContasController();
                yield templateService.apiHandler({
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBalancetesController_getBalancetes = {
        mes: { "in": "query", "name": "mes", "required": true, "dataType": "double" },
        ano: { "in": "query", "name": "ano", "required": true, "dataType": "double" },
        notFoundResponse: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.get('/balancetes', ...((0, runtime_1.fetchMiddlewares)(BalancetesController_1.BalancetesController)), ...((0, runtime_1.fetchMiddlewares)(BalancetesController_1.BalancetesController.prototype.getBalancetes)), function BalancetesController_getBalancetes(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBalancetesController_getBalancetes, request, response });
                const controller = new BalancetesController_1.BalancetesController();
                yield templateService.apiHandler({
                    methodName: 'getBalancetes',
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBalancetesController_postGerarBalancetes = {
        body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "ano": { "dataType": "double", "required": true }, "mes": { "dataType": "double", "required": true } } },
        serverErrorResponse: { "in": "res", "name": "500", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "message": { "dataType": "string", "required": true } } },
    };
    app.post('/balancetes/gerar', ...((0, runtime_1.fetchMiddlewares)(BalancetesController_1.BalancetesController)), ...((0, runtime_1.fetchMiddlewares)(BalancetesController_1.BalancetesController.prototype.postGerarBalancetes)), function BalancetesController_postGerarBalancetes(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBalancetesController_postGerarBalancetes, request, response });
                const controller = new BalancetesController_1.BalancetesController();
                yield templateService.apiHandler({
                    methodName: 'postGerarBalancetes',
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
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
