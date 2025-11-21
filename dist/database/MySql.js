"use strict";
// src/database/MySql.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.executarComandoSQL = executarComandoSQL;
exports.inicializarBancoDeDados = inicializarBancoDeDados;
const promise_1 = __importDefault(require("mysql2/promise"));
// 1. Configuração e Criação do Pool de Conexões
exports.db = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gefin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00", // Manter consistência de timezone
});
console.log("Pool de Conexões MySQL configurado.");
/**
 * Executa um comando SQL (SELECT, INSERT, UPDATE, DELETE, CREATE).
 * @param query Comando SQL a ser executado.
 * @param valores Array de valores para substituição (prevenção de SQL Injection).
 * @returns O resultado da query.
 */
async function executarComandoSQL(query, valores = []) {
    try {
        const [resultado] = await exports.db.execute(query, valores);
        return resultado;
    }
    catch (error) {
        console.error("Erro ao executar comando SQL:", query, error);
        throw error;
    }
}
async function inicializarBancoDeDados() {
    console.log('\n[DB] Iniciando verificação e criação de tabelas (Multi-Tenant)...');
    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS empresas (
            id_empresa INT AUTO_INCREMENT PRIMARY KEY,
            razao_social VARCHAR(150) NOT NULL,
            cnpj VARCHAR(14) UNIQUE NOT NULL
        );
    `);
    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255),
            id_empresa INT NOT NULL,
            FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
        );
    `);
    await executarComandoSQL(`
      CREATE TABLE IF NOT EXISTS contas (
        id_conta INT AUTO_INCREMENT PRIMARY KEY,
        nome_conta VARCHAR(255) NOT NULL,
        tipo_conta ENUM('Ativo', 'Passivo', 'PatrimonioLiquido', 'Receita', 'Despesa') NOT NULL,
        codigo_conta VARCHAR(255) NOT NULL,
        subtipo_conta VARCHAR(255),
        subtipo_secundario VARCHAR(255),
        id_empresa INT NOT NULL,
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
        UNIQUE KEY unique_conta_empresa (codigo_conta, id_empresa)
      );
    `);
    await executarComandoSQL(`
      CREATE TABLE IF NOT EXISTS transacoes (
        id_transacao INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor_total DECIMAL(12, 2) NOT NULL,
        id_balancete INT,
        id_empresa INT NOT NULL,
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
      );
    `);
    await executarComandoSQL(`
      CREATE TABLE IF NOT EXISTS partidas_lancamento (
        id_partida INT AUTO_INCREMENT PRIMARY KEY,
        id_transacao INT NOT NULL,
        id_conta INT NOT NULL,
        tipo_partida VARCHAR(7) NOT NULL CHECK (tipo_partida IN ('debito', 'credito')),
        valor DECIMAL(12, 2) NOT NULL,
        id_empresa INT NOT NULL,
        FOREIGN KEY (id_transacao) REFERENCES transacoes(id_transacao) ON DELETE CASCADE,
        FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
      );
    `);
    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS balancetes (
        id_balancete INT AUTO_INCREMENT PRIMARY KEY,
        id_conta INT NOT NULL,
        id_empresa INT NOT NULL,
        mes TINYINT NOT NULL, 
        ano SMALLINT NOT NULL,
        saldo_inicial DECIMAL(15,2) DEFAULT 0,
        movimento_debito DECIMAL(15,2) DEFAULT 0,
        movimento_credito DECIMAL(15,2) DEFAULT 0,
        saldo_final DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_balancete_conta FOREIGN KEY (id_conta) REFERENCES contas(id_conta),
        CONSTRAINT fk_balancete_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
        CONSTRAINT uq_balancetes_conta_mes_ano UNIQUE (id_conta, id_empresa, mes, ano)
        );
    `);
    console.log('[DB] Inicialização do banco de dados concluída.');
}
