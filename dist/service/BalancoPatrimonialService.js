"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancoPatrimonialService = void 0;
const MySql_1 = require("../database/MySql");
class BalancoPatrimonialService {
    async gerarBalanco(idEmpresa, mes, ano) {
        // Data corte: último dia do mês selecionado
        const dataCorte = `${ano}-${mes}-31 23:59:59`;
        // 1. Busca todas as contas e saldos acumulados
        const sql = `
            SELECT 
                c.id_conta, c.codigo_conta, c.nome_conta, c.tipo_conta,
                SUM(CASE WHEN p.tipo_partida = 'debito' THEN p.valor ELSE 0 END) as total_debito,
                SUM(CASE WHEN p.tipo_partida = 'credito' THEN p.valor ELSE 0 END) as total_credito
            FROM contas c
            LEFT JOIN partidas_lancamento p ON c.id_conta = p.id_conta 
            LEFT JOIN transacoes t ON p.id_transacao = t.id_transacao 
                AND t.data <= ? AND t.id_empresa = ?
            WHERE c.id_empresa = ?
            GROUP BY c.id_conta
            ORDER BY c.codigo_conta ASC
        `;
        const rows = await (0, MySql_1.executarComandoSQL)(sql, [dataCorte, idEmpresa, idEmpresa]);
        const arvore = this.construirArvore(rows);
        // 2. Separa os nós Raiz
        const ativo = arvore.find(n => n.codigo_conta.startsWith('1')) || this.emptyNode('ATIVO');
        const grupo2 = arvore.find(n => n.codigo_conta.startsWith('2')); // Grupo 2 contém Passivo + PL
        // 3. Lógica de Separação (Passivo vs PL)
        let passivo = this.emptyNode('PASSIVO');
        let patrimonioLiquido = this.emptyNode('PATRIMÔNIO LÍQUIDO');
        if (grupo2) {
            const childrenPassivo = [];
            const childrenPL = [];
            // Itera sobre os filhos do grupo 2 (ex: 2.1, 2.2, 2.3)
            grupo2.children.forEach(child => {
                // Critério: Código começa com 2.3 OU Tipo é PatrimonioLiquido OU Nome contém "Patrimônio"
                const isPL = child.codigo_conta.startsWith('2.3') ||
                    child.natureza === 'PatrimonioLiquido' ||
                    child.nome_conta.toUpperCase().includes('PATRIMÔNIO');
                if (isPL) {
                    childrenPL.push(child);
                }
                else {
                    childrenPassivo.push(child);
                }
            });
            // Reconstrói o Passivo (apenas obrigações)
            passivo = {
                ...grupo2,
                nome_conta: 'PASSIVO EXIGÍVEL',
                children: childrenPassivo,
                saldo_atual: childrenPassivo.reduce((acc, c) => acc + c.saldo_atual, 0)
            };
            // Reconstrói o PL
            patrimonioLiquido = {
                codigo_conta: '2.3', // Código virtual para o grupo
                nome_conta: 'PATRIMÔNIO LÍQUIDO',
                tipo: 'grupo',
                nivel: 1,
                saldo_atual: childrenPL.reduce((acc, c) => acc + c.saldo_atual, 0),
                children: childrenPL,
                natureza: 'PatrimonioLiquido'
            };
        }
        return {
            mes,
            ano,
            ativo,
            passivo,
            patrimonioLiquido
        };
    }
    construirArvore(contas) {
        const map = new Map();
        const roots = [];
        // Instancia os nós
        contas.forEach(c => {
            let saldo = Number(c.total_debito) - Number(c.total_credito);
            // Inverte sinal para contas credoras ficarem positivas no relatório visual
            if (['Passivo', 'PatrimonioLiquido', 'Receita'].includes(c.tipo_conta)) {
                saldo = saldo * -1;
            }
            map.set(c.codigo_conta, {
                codigo_conta: c.codigo_conta,
                nome_conta: c.nome_conta,
                saldo_atual: saldo,
                tipo: 'conta',
                nivel: c.codigo_conta.split('.').length,
                children: [],
                natureza: c.tipo_conta // Guarda o tipo original para filtragem posterior
            });
        });
        // Monta a hierarquia
        const sortedKeys = Array.from(map.keys()).sort();
        sortedKeys.forEach(key => {
            const node = map.get(key);
            // Procura o pai (ex: para 1.1.1, o pai é 1.1)
            // Lógica: remove o último segmento após o ponto
            const lastDotIndex = key.lastIndexOf('.');
            const parentKey = lastDotIndex > -1 ? key.substring(0, lastDotIndex) : null;
            // Se pai não encontrado pela lógica de ponto, tenta substring simples (ex: pai de 11 é 1)
            // Mas o padrão mais seguro é o do ponto. Se não tiver ponto, assume raiz.
            if (parentKey && map.has(parentKey)) {
                const parent = map.get(parentKey);
                parent.children.push(node);
                parent.tipo = 'grupo';
                // Opcional: Recalcular saldo do pai somando filhos (Roll-up)
                // Se o banco já traz o saldo correto da conta sintética, não precisa somar aqui.
                // Assumindo que o banco traz saldos individuais, seria ideal somar:
                // parent.saldo_atual += node.saldo_atual;
            }
            else {
                // Se não tem pai (ex: '1' ou '2'), é raiz
                roots.push(node);
            }
        });
        // Função recursiva para garantir que os saldos dos grupos (sintéticos) sejam a soma dos filhos (analíticos)
        // Isso corrige casos onde o banco não tem lançamentos diretos na conta pai
        this.calcularSaldosRecursivos(roots);
        return roots;
    }
    calcularSaldosRecursivos(nodes) {
        nodes.forEach(node => {
            if (node.children.length > 0) {
                this.calcularSaldosRecursivos(node.children);
                // O saldo do grupo é a soma dos filhos
                node.saldo_atual = node.children.reduce((acc, child) => acc + child.saldo_atual, 0);
            }
        });
    }
    emptyNode(nome) {
        return { codigo_conta: '', nome_conta: nome, saldo_atual: 0, tipo: 'grupo', nivel: 0, children: [] };
    }
}
exports.BalancoPatrimonialService = BalancoPatrimonialService;
