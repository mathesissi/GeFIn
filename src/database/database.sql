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
CREATE TABLE IF NOT EXISTS balancetes (
    id_balancete INT AUTO_INCREMENT PRIMARY KEY,
    id_conta INT NOT NULL,
    mes TINYINT NOT NULL, -- 1 a 12
    ano SMALLINT NOT NULL,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    movimento_debito DECIMAL(15,2) DEFAULT 0,
    movimento_credito DECIMAL(15,2) DEFAULT 0,
    saldo_final DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conta FOREIGN KEY (id_conta) REFERENCES contas(id_conta)
    ADD CONSTRAINT uniq_conta_mes_ano UNIQUE (id_conta, mes, ano);
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
CREATE INDEX idx_mes_ano ON balancetes(mes, ano);