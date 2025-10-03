/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LancamentosController } from './../controller/LancamentosController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ContasController } from './../controller/ContasController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BalancoPatrimonialController } from './../controller/BalancetesController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "TipoPartida": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["debito"]},{"dataType":"enum","enums":["credito"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partida": {
        "dataType": "refObject",
        "properties": {
            "id_conta": {"dataType":"double","required":true},
            "tipo_partida": {"ref":"TipoPartida","required":true},
            "valor": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lancamento": {
        "dataType": "refObject",
        "properties": {
            "id_lancamento": {"dataType":"double","required":true},
            "data": {"dataType":"datetime","required":true},
            "descricao": {"dataType":"string","required":true},
            "valor_total": {"dataType":"double","required":true},
            "partidas": {"dataType":"array","array":{"dataType":"refObject","ref":"Partida"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DadosTransacao": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"string","required":true},
            "descricao": {"dataType":"string","required":true},
            "partidas": {"dataType":"array","array":{"dataType":"refObject","ref":"Partida"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TipoConta": {
        "dataType": "refEnum",
        "enums": ["Ativo","Passivo","Patrimonio Liquido","Receita","Despesa"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Conta": {
        "dataType": "refObject",
        "properties": {
            "id_conta": {"dataType":"double","required":true},
            "nome_conta": {"dataType":"string","required":true},
            "tipo_conta": {"ref":"TipoConta","required":true},
            "subtipo_conta": {"dataType":"string"},
            "subtipo_secundario": {"dataType":"string"},
            "codigo_conta": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial__nome_conta-string--tipo_conta-TipoConta--codigo_conta-string--subtipo_conta_63_-string--subtipo_secundario_63_-string__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"nome_conta":{"dataType":"string"},"tipo_conta":{"ref":"TipoConta"},"codigo_conta":{"dataType":"string"},"subtipo_conta":{"dataType":"string"},"subtipo_secundario":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BalancoItem": {
        "dataType": "refObject",
        "properties": {
            "codigo": {"dataType":"string","required":true},
            "nome": {"dataType":"string","required":true},
            "saldo": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BalancoPatrimonial": {
        "dataType": "refObject",
        "properties": {
            "ativo": {"dataType":"nestedObjectLiteral","nestedProperties":{"total":{"dataType":"double","required":true},"naoCirculante":{"dataType":"array","array":{"dataType":"refObject","ref":"BalancoItem"},"required":true},"circulante":{"dataType":"array","array":{"dataType":"refObject","ref":"BalancoItem"},"required":true}},"required":true},
            "passivo": {"dataType":"nestedObjectLiteral","nestedProperties":{"total":{"dataType":"double","required":true},"naoCirculante":{"dataType":"array","array":{"dataType":"refObject","ref":"BalancoItem"},"required":true},"circulante":{"dataType":"array","array":{"dataType":"refObject","ref":"BalancoItem"},"required":true}},"required":true},
            "patrimonioLiquido": {"dataType":"nestedObjectLiteral","nestedProperties":{"total":{"dataType":"double","required":true},"contas":{"dataType":"array","array":{"dataType":"refObject","ref":"BalancoItem"},"required":true}},"required":true},
            "totais": {"dataType":"nestedObjectLiteral","nestedProperties":{"diferenca":{"dataType":"double","required":true},"totalPassivoPL":{"dataType":"double","required":true},"totalAtivo":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsLancamentosController_criarLancamento: Record<string, TsoaRoute.ParameterSchema> = {
                dadosTransacao: {"in":"body","name":"dadosTransacao","required":true,"ref":"DadosTransacao"},
                badRequestResponse: {"in":"res","name":"400","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.post('/lancamentos',
            ...(fetchMiddlewares<RequestHandler>(LancamentosController)),
            ...(fetchMiddlewares<RequestHandler>(LancamentosController.prototype.criarLancamento)),

            async function LancamentosController_criarLancamento(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_criarLancamento, request, response });

                const controller = new LancamentosController();

              await templateService.apiHandler({
                methodName: 'criarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLancamentosController_listarLancamentos: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/lancamentos',
            ...(fetchMiddlewares<RequestHandler>(LancamentosController)),
            ...(fetchMiddlewares<RequestHandler>(LancamentosController.prototype.listarLancamentos)),

            async function LancamentosController_listarLancamentos(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_listarLancamentos, request, response });

                const controller = new LancamentosController();

              await templateService.apiHandler({
                methodName: 'listarLancamentos',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLancamentosController_buscarLancamentoPorId: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.get('/lancamentos/:id',
            ...(fetchMiddlewares<RequestHandler>(LancamentosController)),
            ...(fetchMiddlewares<RequestHandler>(LancamentosController.prototype.buscarLancamentoPorId)),

            async function LancamentosController_buscarLancamentoPorId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_buscarLancamentoPorId, request, response });

                const controller = new LancamentosController();

              await templateService.apiHandler({
                methodName: 'buscarLancamentoPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLancamentosController_atualizarLancamento: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                dadosAtualizados: {"in":"body","name":"dadosAtualizados","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"partidas":{"dataType":"array","array":{"dataType":"refObject","ref":"Partida"}},"descricao":{"dataType":"string"},"data":{"dataType":"string"}}},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
                badRequestResponse: {"in":"res","name":"400","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.put('/lancamentos/:id',
            ...(fetchMiddlewares<RequestHandler>(LancamentosController)),
            ...(fetchMiddlewares<RequestHandler>(LancamentosController.prototype.atualizarLancamento)),

            async function LancamentosController_atualizarLancamento(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_atualizarLancamento, request, response });

                const controller = new LancamentosController();

              await templateService.apiHandler({
                methodName: 'atualizarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLancamentosController_deletarLancamento: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.delete('/lancamentos/:id',
            ...(fetchMiddlewares<RequestHandler>(LancamentosController)),
            ...(fetchMiddlewares<RequestHandler>(LancamentosController.prototype.deletarLancamento)),

            async function LancamentosController_deletarLancamento(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLancamentosController_deletarLancamento, request, response });

                const controller = new LancamentosController();

              await templateService.apiHandler({
                methodName: 'deletarLancamento',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsContasController_criarConta: Record<string, TsoaRoute.ParameterSchema> = {
                dadosConta: {"in":"body","name":"dadosConta","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"subtipo_secundario":{"dataType":"string"},"subtipo_conta":{"dataType":"string"},"codigo_conta":{"dataType":"string","required":true},"tipo_conta":{"ref":"TipoConta","required":true},"nome_conta":{"dataType":"string","required":true}}},
                badRequestResponse: {"in":"res","name":"400","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.post('/contas',
            ...(fetchMiddlewares<RequestHandler>(ContasController)),
            ...(fetchMiddlewares<RequestHandler>(ContasController.prototype.criarConta)),

            async function ContasController_criarConta(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_criarConta, request, response });

                const controller = new ContasController();

              await templateService.apiHandler({
                methodName: 'criarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsContasController_listarContas: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/contas',
            ...(fetchMiddlewares<RequestHandler>(ContasController)),
            ...(fetchMiddlewares<RequestHandler>(ContasController.prototype.listarContas)),

            async function ContasController_listarContas(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_listarContas, request, response });

                const controller = new ContasController();

              await templateService.apiHandler({
                methodName: 'listarContas',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsContasController_buscarContaPorId: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.get('/contas/:id',
            ...(fetchMiddlewares<RequestHandler>(ContasController)),
            ...(fetchMiddlewares<RequestHandler>(ContasController.prototype.buscarContaPorId)),

            async function ContasController_buscarContaPorId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_buscarContaPorId, request, response });

                const controller = new ContasController();

              await templateService.apiHandler({
                methodName: 'buscarContaPorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsContasController_atualizarConta: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                dadosAtualizados: {"in":"body","name":"dadosAtualizados","required":true,"ref":"Partial__nome_conta-string--tipo_conta-TipoConta--codigo_conta-string--subtipo_conta_63_-string--subtipo_secundario_63_-string__"},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
                badRequestResponse: {"in":"res","name":"400","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.put('/contas/:id',
            ...(fetchMiddlewares<RequestHandler>(ContasController)),
            ...(fetchMiddlewares<RequestHandler>(ContasController.prototype.atualizarConta)),

            async function ContasController_atualizarConta(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_atualizarConta, request, response });

                const controller = new ContasController();

              await templateService.apiHandler({
                methodName: 'atualizarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsContasController_deletarConta: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                notFoundResponse: {"in":"res","name":"404","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.delete('/contas/:id',
            ...(fetchMiddlewares<RequestHandler>(ContasController)),
            ...(fetchMiddlewares<RequestHandler>(ContasController.prototype.deletarConta)),

            async function ContasController_deletarConta(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsContasController_deletarConta, request, response });

                const controller = new ContasController();

              await templateService.apiHandler({
                methodName: 'deletarConta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBalancoPatrimonialController_getBalanco: Record<string, TsoaRoute.ParameterSchema> = {
                mes: {"in":"query","name":"mes","required":true,"dataType":"double"},
                ano: {"in":"query","name":"ano","required":true,"dataType":"double"},
                serverErrorResponse: {"in":"res","name":"500","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.get('/balanco-patrimonial',
            ...(fetchMiddlewares<RequestHandler>(BalancoPatrimonialController)),
            ...(fetchMiddlewares<RequestHandler>(BalancoPatrimonialController.prototype.getBalanco)),

            async function BalancoPatrimonialController_getBalanco(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBalancoPatrimonialController_getBalanco, request, response });

                const controller = new BalancoPatrimonialController();

              await templateService.apiHandler({
                methodName: 'getBalanco',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
