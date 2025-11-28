import { executarComandoSQL } from '../database/MySql';
import { BalancoLine, BalancoPatrimonialReport } from '../model/RelatoriosModel';

export class BalancoPatrimonialService {

    public async gerarBalanco(idEmpresa: number, mes: number, ano: number): Promise<BalancoPatrimonialReport> {
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

        const rows = await executarComandoSQL(sql, [dataCorte, idEmpresa, idEmpresa]);
        const arvore = this.construirArvore(rows);

        // 2. Separa os nós Raiz
        // Busca o Ativo (Geralmente existe um pai "1", mas o filtro é seguro)
        const ativo = arvore.find(n => n.codigo_conta.startsWith('1')) || this.emptyNode('ATIVO');
        
        // CORREÇÃO: Busca TODOS os nós raízes que começam com 2 (Passivo/PL)
        // Isso resolve o problema de quando não existe uma conta pai "2" unificadora
        const rootsGrupo2 = arvore.filter(n => n.codigo_conta.startsWith('2'));

        // 3. Lógica de Separação (Passivo vs PL)
        let childrenPassivo: BalancoLine[] = [];
        let childrenPL: BalancoLine[] = [];

        // Função auxiliar para identificar PL
        const isPL = (node: BalancoLine) => {
            return node.codigo_conta.startsWith('2.3') || 
                   node.natureza === 'PatrimonioLiquido' || 
                   node.nome_conta.toUpperCase().includes('PATRIMÔNIO') ||
                   node.nome_conta.toUpperCase().includes('CAPITAL SOCIAL');
        };

        rootsGrupo2.forEach(node => {
            // Cenário A: Existe uma conta pai "2" que agrupa tudo
            if (node.codigo_conta === '2' || node.codigo_conta === '2.' || node.codigo_conta === '2.0') {
                node.children.forEach(child => {
                    if (isPL(child)) childrenPL.push(child);
                    else childrenPassivo.push(child);
                });
            } 
            // Cenário B: As contas 2.1, 2.2, 2.3 são raízes independentes (Seu caso provável)
            else {
                if (isPL(node)) childrenPL.push(node);
                else childrenPassivo.push(node);
            }
        });

        // 4. Reconstrói os objetos finais agrupados
        const passivo: BalancoLine = {
            codigo_conta: '2',
            nome_conta: 'PASSIVO EXIGÍVEL',
            tipo: 'grupo',
            nivel: 0,
            children: childrenPassivo,
            saldo_atual: childrenPassivo.reduce((acc, c) => acc + c.saldo_atual, 0)
        };

        const patrimonioLiquido: BalancoLine = {
            codigo_conta: '2.3',
            nome_conta: 'PATRIMÔNIO LÍQUIDO',
            tipo: 'grupo',
            nivel: 0,
            saldo_atual: childrenPL.reduce((acc, c) => acc + c.saldo_atual, 0),
            children: childrenPL,
            natureza: 'PatrimonioLiquido'
        };

        return {
            mes,
            ano,
            ativo,
            passivo,
            patrimonioLiquido
        };
    }

    private construirArvore(contas: any[]): BalancoLine[] {
        const map = new Map<string, BalancoLine>();
        const roots: BalancoLine[] = [];

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
            const node = map.get(key)!;
            
            // Lógica de busca de pai: Remove o último segmento do código (ex: 2.1.1 -> 2.1)
            const lastDotIndex = key.lastIndexOf('.');
            const parentKey = lastDotIndex > -1 ? key.substring(0, lastDotIndex) : null;
            
            if (parentKey && map.has(parentKey)) {
                const parent = map.get(parentKey)!;
                parent.children.push(node);
                parent.tipo = 'grupo'; 
                
                // Opcional: Somar o saldo dos filhos ao pai se o pai for puramente sintético
                // Se o banco traz saldos individuais por lançamento, não precisa somar aqui se a query já agrupa.
                // Mas para garantir consistência visual da árvore:
                // parent.saldo_atual += node.saldo_atual; 
            } else {
                // Se não tem pai encontrado no map, é raiz
                roots.push(node);
            }
        });

        // Recalcula saldos dos grupos pais recursivamente para garantir integridade
        this.calcularSaldosRecursivos(roots);

        return roots;
    }

    private calcularSaldosRecursivos(nodes: BalancoLine[]) {
        nodes.forEach(node => {
            if (node.children.length > 0) {
                this.calcularSaldosRecursivos(node.children);
                // O saldo do grupo é a soma dos filhos
                node.saldo_atual = node.children.reduce((acc, child) => acc + child.saldo_atual, 0);
            }
        });
    }

    private emptyNode(nome: string): BalancoLine {
        return { codigo_conta: '', nome_conta: nome, saldo_atual: 0, tipo: 'grupo', nivel: 0, children: [] };
    }
}