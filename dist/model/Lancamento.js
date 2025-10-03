"use strict";
// Lancamento.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lancamento = void 0;
/**
 * Representa uma transação contábil composta (com múltiplas partidas).
 */
class Lancamento {
    /**
     * Cria uma nova instância de Lancamento (agora Transação Composta).
     * @param id_lancamento O ID único da transação.
     * @param data A data da transação.
     * @param descricao Uma descrição detalhada da transação.
     * @param valor_total O valor total da transação (soma dos débitos/créditos).
     * @param partidas A lista de partidas (débitos e créditos).
     */
    constructor(id_lancamento, data, descricao, valor_total, partidas) {
        if (!(data instanceof Date) || isNaN(data.getTime())) {
            throw new Error('A data fornecida é inválida.');
        }
        if (typeof descricao !== 'string' || descricao.trim() === '') {
            throw new Error('A descrição não pode ser vazia.');
        }
        if (typeof valor_total !== 'number' || valor_total < 0) {
            throw new Error('O valor total do lançamento deve ser um número não negativo.');
        }
        if (!Array.isArray(partidas)) {
            throw new Error('Partidas deve ser um array.');
        }
        this.id_lancamento = id_lancamento;
        this.data = data;
        this.descricao = descricao;
        this.valor_total = valor_total;
        this.partidas = partidas;
    }
    /**
     * Retorna uma representação formatada do lançamento em uma string.
     * @returns Uma string com os detalhes do lançamento.
     */
    exibirLancamento() {
        let output = `ID: ${this.id_lancamento}\n` +
            `Data: ${this.data.toLocaleDateString()}\n` +
            `Descrição: ${this.descricao}\n` +
            `Valor Total: R$ ${this.valor_total.toFixed(2)}\n` +
            `Detalhes das Partidas:\n`;
        this.partidas.forEach(p => {
            output += `  - Conta ${p.id_conta} (${p.tipo_partida.toUpperCase()}): R$ ${p.valor.toFixed(2)}\n`;
        });
        return output;
    }
}
exports.Lancamento = Lancamento;
