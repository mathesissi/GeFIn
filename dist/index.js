"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); 
const routes_1 = require("./route/routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const Swagger_1 = require("./config/Swagger");
const cors_1 = __importDefault(require("cors"));
const tsoa_1 = require("tsoa");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());

app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(Swagger_1.swaggerSpec));
(0, routes_1.RegisterRoutes)(app);
// ----------------------------------------------------------------------
// MIDDLEWARE DE TRATAMENTO DE ERRO GLOBAL (Solução)
// ----------------------------------------------------------------------
app.use(function errorHandler(err, req, res, next) {
    // 1. Tratamento de Erros de Validação do TSOA
    if (err instanceof tsoa_1.ValidateError) {
        // console.warn(`Erro de Validação TSOA: ${err.status}`, err.fields);
        return res.status(400).json({
            message: "Erro de Validação na Requisição.",
            details: err.fields,
        });
    }
    // 2. Tratamento para Erros Lançados no Service (como "Já existe uma conta...")
    if (err instanceof Error) {
        // Se a mensagem do erro não foi tratada no Controller (o que acontece)
        // Retornamos 400 (Bad Request) e a mensagem de erro em JSON.
        return res.status(400).json({
            message: err.message
        });
    }
    // 3. Tratamento de Erros de Servidor (Fallback para qualquer erro não mapeado)
    // console.error("Erro Não Tratado (500):", err);
    return res.status(500).json({
        message: "Erro Interno do Servidor. Contate o suporte.",
    });
});
// ----------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Swagger docs disponíveis em http://localhost:${port}/docs`);
});
