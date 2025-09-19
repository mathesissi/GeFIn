-- Tabela de contas
CREATE TABLE contas (
    id_conta SERIAL PRIMARY KEY,
    nome_conta VARCHAR(100) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL,
    codigo_conta VARCHAR(20) UNIQUE
);

-- Tabela de balancetes
CREATE TABLE balancetes (
    id_balancete SERIAL PRIMARY KEY,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL
);

-- Tabela de lançamentos
CREATE TABLE lancamentos (
    id_lancamento SERIAL PRIMARY KEY, --REGISTROS
    data DATE NOT NULL,
    descricao TEXT,
    valor NUMERIC(12,2) NOT NULL,
    id_conta_debito INT NOT NULL REFERENCES contas(id_conta),
    id_conta_credito INT NOT NULL REFERENCES contas(id_conta),
    id_balancete INT REFERENCES balancetes(id_balancete)
);

-- Índices para otimizar consultas
CREATE INDEX idx_lancamentos_data ON lancamentos(data);
CREATE INDEX idx_lancamentos_conta ON lancamentos(id_conta_debito, id_conta_credito);


