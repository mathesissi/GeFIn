import { executarComandoSQL } from '../database/MySql';
import { BalancoLine, BalancoPatrimonialReport } from '../model/RelatoriosModel';

export class BalancoPatrimonialService {

    public async gerarBalanco(idEmpresa: number, mes: number, ano: number): Promise<BalancoPatrimonialReport> {
        // Data corte: último dia do mês selecionado
        // Ajuste para pegar o último segundo do mês corretamente
        const dataCorte = `${ano}-${mes.toString().padStart(2, '0')}-31 23:59:59`;

        // 1. Busca todas as contas e saldos acumulados até a data de corte
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
            GROUP BY c.id_conta, c.codigo_conta, c.nome_conta, c.tipo_conta
            ORDER BY c.codigo_conta ASC
        `;

        const rows = await executarComandoSQL(sql, [dataCorte, idEmpresa, idEmpresa]);

        // Constrói a árvore completa
        const arvore = this.construirArvore(rows);

        // 2. Separa os nós Raiz
        // Tenta encontrar a raiz "1" (Ativo) e "2" (Passivo)
        let ativo = arvore.find(n => n.codigo_conta.startsWith('1') && n.nivel === 1);

        // Se não achar raiz exata "1", cria uma fake e agrupa todos que começam com 1
        if (!ativo) {
            ativo = this.criarGrupoArtificial('ATIVO', '1', arvore.filter(n => n.codigo_conta.startsWith('1')));
        }

        // Para Passivo e PL, a lógica é mais complexa pois podem estar juntos ou separados
        const rootsPassivoPL = arvore.filter(n => n.codigo_conta.startsWith('2'));

        let passivo: BalancoLine;
        let patrimonioLiquido: BalancoLine;

        const nosPL: BalancoLine[] = [];
        const nosPassivo: BalancoLine[] = [];

        // Função para identificar se é PL (Código 2.3 ou Natureza)
        const isPL = (n: BalancoLine) => n.codigo_conta.startsWith('2.3') || n.natureza === 'PatrimonioLiquido';

        // Separa os filhos
        rootsPassivoPL.forEach(node => {
            // Se o nó já for a raiz "2", olhamos seus filhos
            if (node.codigo_conta === '2') {
                node.children.forEach(child => {
                    if (isPL(child)) nosPL.push(child);
                    else nosPassivo.push(child);
                });
            } else {
                // Se forem nós soltos (ex: 2.1 e 2.3 na raiz)
                if (isPL(node)) nosPL.push(node);
                else nosPassivo.push(node);
            }
        });

        passivo = this.criarGrupoArtificial('PASSIVO', '2', nosPassivo);
        patrimonioLiquido = this.criarGrupoArtificial('PATRIMÔNIO LÍQUIDO', '2.3', nosPL);

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

        // 1. Cria todos os nós
        contas.forEach(c => {
            let saldo = Number(c.total_debito || 0) - Number(c.total_credito || 0);

            // Inverte sinal para contas de natureza Credora (Passivo, PL, Receita)
            // Obs: Receita/Despesa tecnicamente zeram no fim do exercício, mas no Balancete acumulado aparecem.
            if (['Passivo', 'PatrimonioLiquido', 'Receita'].includes(c.tipo_conta)) {
                saldo = saldo * -1;
            }

            // Define o nível baseado nos pontos (ex: 1.1.1 = nível 3)
            const nivel = c.codigo_conta.split('.').length;

            map.set(c.codigo_conta, {
                codigo_conta: c.codigo_conta,
                nome_conta: c.nome_conta,
                saldo_atual: saldo,
                tipo: 'conta',
                nivel: nivel,
                children: [],
                natureza: c.tipo_conta
            });
        });

        // 2. Monta a hierarquia (Parent/Child)
        // Ordena chaves para garantir que pais venham antes ou sejam processados corretamente
        const sortedKeys = Array.from(map.keys()).sort();

        sortedKeys.forEach(key => {
            const node = map.get(key)!;

            // Lógica para achar o pai: 1.1.1 -> pai é 1.1
            const lastDotIndex = key.lastIndexOf('.');
            const parentKey = lastDotIndex > -1 ? key.substring(0, lastDotIndex) : null;

            if (parentKey && map.has(parentKey)) {
                const parent = map.get(parentKey)!;
                parent.children.push(node);
                parent.tipo = 'grupo'; // Se tem filho, vira grupo
            } else {
                roots.push(node);
            }
        });

        // 3. Recalcula saldos dos grupos (Soma dos filhos)
        // Isso garante que o saldo do grupo "1.1" seja a soma de todos os "1.1.x"
        this.calcularSaldosRecursivos(roots);

        return roots;
    }

    private calcularSaldosRecursivos(nodes: BalancoLine[]) {
        nodes.forEach(node => {
            if (node.children.length > 0) {
                this.calcularSaldosRecursivos(node.children);
                // O saldo do pai é a soma dos saldos dos filhos
                node.saldo_atual = node.children.reduce((acc, child) => acc + child.saldo_atual, 0);
            }
        });
    }

    private criarGrupoArtificial(nome: string, codigo: string, children: BalancoLine[]): BalancoLine {
        const saldoTotal = children.reduce((acc, c) => acc + c.saldo_atual, 0);
        return {
            codigo_conta: codigo,
            nome_conta: nome,
            saldo_atual: saldoTotal,
            tipo: 'grupo',
            nivel: 0,
            children: children
        };
    }
}