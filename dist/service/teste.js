"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Contas_1 = require("../model/Contas");
const Lancamento_1 = require("../model/Lancamento");
const balancete_1 = require("../model/balancete");
// 1. Criando uma conta de ativo
const contaCaixa = new Contas_1.Conta(1, 'Caixa', Contas_1.TipoConta.Ativo, '1.1.1.001', Contas_1.SubtipoAtivo.Circulante);
console.log('Conta criada:');
contaCaixa.exibirConta();
console.log('\n---');
// 2. Criando um lançamento
const lancamentoVenda = new Lancamento_1.Lancamento('LANC-001', new Date(), 'Venda de produto A', 1000, contaCaixa.id_conta.toString(), // A conta de débito seria "Clientes" (não criada aqui)
'4.1.1.001' // Exemplo: Conta de Receita
);
console.log('Lançamento criado:');
lancamentoVenda.exibirLancamento();
console.log('\n---');
// 3. Criando um balancete
const balanceteExemplo = new balancete_1.Balancete('BAL-001', 1, 2024, '1.1.1.001', // ID da conta do balancete
5000, // Saldo inicial
6000 // Saldo final
);
console.log('Balancete criado:');
balanceteExemplo.exibirBalancete();
console.log('\n---');
// 4. Testando o cálculo de movimentação
const movimentacao = balanceteExemplo.calcularMovimentacao();
console.log(`Movimentação da conta: R$ ${movimentacao.toFixed(2)}`);
//# sourceMappingURL=teste.js.map