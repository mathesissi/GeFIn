"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./route/routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const Swagger_1 = require("./config/Swagger");
const cors_1 = __importDefault(require("cors")); // <--- 1. IMPORTE O PACOTE CORS AQUI
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)()); // <--- 2. ADICIONE ESTA LINHA AQUI
// Rota para a documentação do Swagger
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(Swagger_1.swaggerSpec));
(0, routes_1.RegisterRoutes)(app);
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Swagger docs disponíveis em http://localhost:${port}/docs`);
});
