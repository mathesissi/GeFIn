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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./route/routes");
const promise_1 = __importDefault(require("mysql2/promise"));
require("reflect-metadata");
const app = (0, express_1.default)();
// ================= MIDDLEWARES =================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ================= ROTAS DE ARQUIVOS ESTÁTICOS =================
// Serve toda a pasta src/web
app.use('/web', express_1.default.static(path_1.default.join(__dirname, '../web')));
// ================= CONEXÃO COM BANCO =================
exports.db = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gefin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// ================= ROTAS DA API =================
(0, routes_1.RegisterRoutes)(app);
// ================= ROTAS ADICIONAIS =================
// Balancete
app.get('/balancete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mes = parseInt(req.query.mes);
        const ano = parseInt(req.query.ano);
        if (isNaN(mes) || isNaN(ano)) {
            return res.status(400).json({ message: 'Mês ou ano inválido' });
        }
        const [rows] = yield exports.db.query(`SELECT c.id_conta, c.codigo_conta, c.nome_conta,
        SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE 0 END) AS total_debito,
        SUM(CASE WHEN p.tipo_partida = 'credito' THEN p.valor ELSE 0 END) AS total_credito
       FROM contas c
       LEFT JOIN partidas_lancamento p ON c.id_conta = p.id_conta
       LEFT JOIN transacoes t ON p.id_transacao = t.id_transacao
       WHERE MONTH(t.data) = ? AND YEAR(t.data) = ?
       GROUP BY c.id_conta
       ORDER BY c.codigo_conta`, [mes, ano]);
        const contas = [];
        for (const r of rows) {
            const contaId = r.id_conta;
            const [prev] = yield exports.db.query(`SELECT saldo_final FROM balancetes WHERE id_conta = ? AND mes = ? AND ano = ?`, [contaId, mes === 1 ? 12 : mes - 1, mes === 1 ? ano - 1 : ano]);
            const saldoInicial = prev.length > 0 ? Number(prev[0].saldo_final) : 0;
            const movimentoDebito = Number(r.total_debito || 0);
            const movimentoCredito = Number(r.total_credito || 0);
            const saldoFinal = saldoInicial + movimentoDebito - movimentoCredito;
            contas.push({
                codigo_conta: r.codigo_conta,
                nome_conta: r.nome_conta,
                total_debito: movimentoDebito,
                total_credito: movimentoCredito,
                saldo_inicial: saldoInicial,
                saldo_final: saldoFinal,
            });
            // Inserir ou atualizar balancete
            yield exports.db.query(`INSERT INTO balancetes (id_conta, mes, ano, saldo_inicial, movimento_debito, movimento_credito, saldo_final)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           saldo_inicial = VALUES(saldo_inicial),
           movimento_debito = VALUES(movimento_debito),
           movimento_credito = VALUES(movimento_credito),
           saldo_final = VALUES(saldo_final),
           updated_at = CURRENT_TIMESTAMP`, [contaId, mes, ano, saldoInicial, movimentoDebito, movimentoCredito, saldoFinal]);
        }
        const total_debitos = contas.reduce((acc, r) => acc + r.total_debito, 0);
        const total_creditos = contas.reduce((acc, r) => acc + r.total_credito, 0);
        return res.json({ contas, total_debitos, total_creditos });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao gerar balancete' });
    }
}));
// Balanço Patrimonial
// Balanço Patrimonial detalhado por conta
app.get('/balanco', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mes = parseInt(req.query.mes);
        const ano = parseInt(req.query.ano);
        if (isNaN(mes) || isNaN(ano)) {
            return res.status(400).json({ message: 'Mês ou ano inválido' });
        }
        // Puxa todas as contas e seus saldos
        const [rows] = yield exports.db.query(`SELECT c.tipo_conta, c.codigo_conta, c.nome_conta,
              b.saldo_inicial, b.saldo_final
       FROM contas c
       LEFT JOIN balancetes b ON c.id_conta = b.id_conta AND b.mes = ? AND b.ano = ?
       ORDER BY FIELD(c.tipo_conta, 'Ativo', 'Passivo', 'Patrimonio Liquido', 'Receita', 'Despesa'), c.codigo_conta`, [mes, ano]);
        // Agrupa por tipo de conta
        const balanco = {
            Ativo: [],
            Passivo: [],
            'Patrimonio Liquido': [],
            Receita: [],
            Despesa: []
        };
        rows.forEach(r => {
            if (!balanco[r.tipo_conta])
                balanco[r.tipo_conta] = [];
            balanco[r.tipo_conta].push({
                codigo_conta: r.codigo_conta,
                nome_conta: r.nome_conta,
                saldo_inicial: r.saldo_inicial || 0,
                saldo_final: r.saldo_final || 0
            });
        });
        return res.json({ balanco });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao gerar balanço patrimonial' });
    }
}));
// ================= ERRO 404 =================
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
// ================= INICIAR SERVIDOR =================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
