-- Tabela de contas
CREATE TABLE contas (
    id_conta SERIAL PRIMARY KEY,
    nome_conta VARCHAR(100) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL,
    codigo_conta VARCHAR(20) UNIQUE,
    subtipo_conta VARCHAR(100),
    subtipo_secundario VARCHAR(100)
);

-- Tabela de balancetes (Atualizada para incluir movimento débito e crédito)
CREATE TABLE balancetes (
    id_balancete SERIAL PRIMARY KEY,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL,
    id_conta INT NOT NULL REFERENCES contas(id_conta),
    saldo_inicial NUMERIC(12,2) NOT NULL,
    movimento_debito NUMERIC(12,2) NOT NULL DEFAULT 0,  -- NOVO CAMPO
    movimento_credito NUMERIC(12,2) NOT NULL DEFAULT 0, -- NOVO CAMPO
    saldo_final NUMERIC(12,2) NOT NULL,
    UNIQUE KEY uk_balancete_periodo_conta (mes, ano, id_conta)
);

-- Tabela de Transações (Cabeçalho do lançamento contábil)
CREATE TABLE transacoes (
    id_transacao SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    descricao TEXT,
    valor_total NUMERIC(12,2) NOT NULL,
    id_balancete INT REFERENCES balancetes(id_balancete)
);

-- Tabela de Partidas do Lançamento (Itens de Débito/Crédito)
CREATE TABLE partidas_lancamento (
    id_partida SERIAL PRIMARY KEY,
    id_transacao INT NOT NULL REFERENCES transacoes(id_transacao) ON DELETE CASCADE,
    id_conta INT NOT NULL REFERENCES contas(id_conta),
    tipo_partida VARCHAR(7) NOT NULL CHECK (tipo_partida IN ('debito', 'credito')),
    valor NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_valor_positivo CHECK (valor > 0)
);

-- Índices para otimizar consultas
CREATE INDEX idx_lancamentos_data ON transacoes(data);
CREATE INDEX idx_lancamentos_conta ON partidas_lancamento(id_conta);