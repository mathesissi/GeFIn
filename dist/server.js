"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata");
// Importa apenas a função de inicialização e o utilitário de query/pool
const MySql_1 = require("./database/MySql");
const routes_1 = require("./route/routes"); // TSOA
const app = (0, express_1.default)();
const PORT = 3000;
// ================= MIDDLEWARES =================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve arquivos estáticos
app.use('/web', express_1.default.static(path_1.default.join(__dirname, '../web')));
// ================= INICIALIZAÇÃO ASSÍNCRONA E INÍCIO DO SERVIDOR =================
async function startServer() {
    try {
        // ETAPA CRÍTICA: Inicializa o banco de dados e cria tabelas
        await (0, MySql_1.inicializarBancoDeDados)();
        // ROTAS DA API
        // Nota: Você precisará ajustar os Controllers e Services que usam SQL diretamente aqui
        // para usar a injeção de dependência e os filtros id_empresa.
        (0, routes_1.RegisterRoutes)(app);
        // ERRO 404
        app.use((req, res) => {
            res.status(404).json({ message: 'Rota não encontrada' });
        });
        app.listen(PORT, () => {
            console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Falha ao iniciar o servidor ou conectar ao banco de dados:', error);
        process.exit(1);
    }
}
startServer();
