
import { getLivroRazao, getDRE, getIndicadores } from './api.js';
import { initUserProfile, checkAuthRedirect} from './UserProfile.js';
if (!checkAuthRedirect()) {
    throw new Error("Não autenticado");
}
document.addEventListener('DOMContentLoaded', async() => {
    await initUserProfile(); 
    // Elementos DOM
    const reportCards = document.querySelectorAll('.report-card');
    const filterForm = document.getElementById('report-filter-form');
    const reportViewContainer = document.getElementById('report-view-container');
    const reportTitle = document.getElementById('report-title');
    
    // Views
    const views = {
        'livro-razao': document.getElementById('livro-razao-view'),
        'dre': document.getElementById('dre-view'),
        'indicadores': document.getElementById('indicadores-view')
    };

    let currentReportType = null;

    // 1. Seleção de Relatório
    reportCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class de todos
            reportCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');

            const reportType = card.dataset.report;
            currentReportType = reportType;
            
            // Atualiza título e mostra container
            reportTitle.textContent = card.querySelector('h3').textContent;
            reportViewContainer.style.display = 'block';

            // Esconde todas as views e mostra a selecionada
            Object.values(views).forEach(v => v.style.display = 'none');
            if(views[reportType]) views[reportType].style.display = 'block';

            carregarRelatorio();
        });
    });

    // 2. Filtro (Mês/Ano)
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentReportType) carregarRelatorio();
    });

    async function carregarRelatorio() {
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;

        try {
            if (typeof showSystemNotification === 'function') 
                showSystemNotification('Carregando dados...', 'info', 1000);

            if (currentReportType === 'livro-razao') {
                const dados = await getLivroRazao(mes, ano);
                renderLivroRazao(dados);
            } 
            else if (currentReportType === 'dre') {
                const dados = await getDRE(mes, ano);
                renderDRE(dados);
            } 
            else if (currentReportType === 'indicadores') {
                const dados = await getIndicadores(mes, ano);
                renderIndicadores(dados);
            }

        } catch (error) {
            console.error(error);
            if (typeof showSystemNotification === 'function') 
                showSystemNotification('Erro ao carregar relatório.', 'error');
        }
    }

    // --- RENDERIZAÇÃO: LIVRO RAZÃO ---
    function renderLivroRazao(contas) {
        const container = document.getElementById('livro-razao-container');
        container.innerHTML = '';

        if (!contas || contas.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma movimentação encontrada para o período.</p>';
            return;
        }

        contas.forEach(conta => {
            // Cria um bloco para cada conta
            const accountBlock = document.createElement('div');
            accountBlock.className = 'account-ledger-block';
            
            // Cabeçalho da Conta
            const header = document.createElement('div');
            header.className = 'ledger-header';
            header.innerHTML = `<h4>${conta.codigo_conta} - ${conta.nome_conta}</h4>`;
            
            // Tabela de Movimentos
            const table = document.createElement('table');
            table.className = 'data-table ledger-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th width="15%">Data</th>
                        <th width="45%">Histórico</th>
                        <th width="13%" class="text-right">Débito</th>
                        <th width="13%" class="text-right">Crédito</th>
                        <th width="14%" class="text-right">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="ledger-initial-balance">
                        <td colspan="2"><strong>Saldo Anterior</strong></td>
                        <td></td>
                        <td></td>
                        <td class="text-right"><strong>${formatMoney(conta.saldo_anterior)}</strong></td>
                    </tr>
                </tbody>
            `;

            const tbody = table.querySelector('tbody');

            // Linhas de Transação
            conta.registros.forEach(reg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatDate(reg.data)}</td>
                    <td>${reg.descricao}</td>
                    <td class="text-right text-danger">${reg.debito > 0 ? formatMoney(reg.debito) : ''}</td>
                    <td class="text-right text-primary">${reg.credito > 0 ? formatMoney(reg.credito) : ''}</td>
                    <td class="text-right font-weight-bold">${formatMoney(reg.saldo_acumulado)}</td>
                `;
                tbody.appendChild(tr);
            });

            // Saldo Final
            const footerRow = document.createElement('tr');
            footerRow.className = 'ledger-final-balance';
            footerRow.innerHTML = `
                <td colspan="4" class="text-right"><strong>Saldo Final:</strong></td>
                <td class="text-right"><strong>${formatMoney(conta.saldo_final)}</strong></td>
            `;
            tbody.appendChild(footerRow);

            accountBlock.appendChild(header);
            accountBlock.appendChild(table);
            container.appendChild(accountBlock);
        });
    }

    // --- RENDERIZAÇÃO: DRE (COM AV/AH) ---
    function renderDRE(dreData) {
        const tbody = document.getElementById('dre-tbody');
        tbody.innerHTML = '';

        // Função recursiva para desenhar linhas e filhas
        function desenharLinha(linha, indentLevel = 0) {
            const tr = document.createElement('tr');
            
            // Estilização baseada no tipo e nível
            const isTitle = linha.tipo === 'titulo';
            const isSubtotal = linha.tipo === 'subtotal' || linha.tipo === 'calculo';
            
            let descClass = '';
            if (isTitle) descClass = 'font-weight-bold text-uppercase';
            else if (isSubtotal) descClass = 'font-weight-bold';
            
            // Indentação visual
            const paddingLeft = indentLevel * 20 + 'px';

            // Formatação dos valores
            const valorFormatado = linha.tipo === 'titulo' ? '' : formatMoney(linha.valor);
            
            // Formatação AV/AH (Se existirem no JSON)
            const av = linha.analiseVertical ? `${linha.analiseVertical}%` : '-';
            const ah = linha.analiseHorizontal ? `${linha.analiseHorizontal}%` : '-';

            tr.innerHTML = `
                <td style="padding-left: ${paddingLeft};" class="${descClass}">${linha.descricao}</td>
                <td class="text-right ${descClass}">${valorFormatado}</td>
                <td class="text-center small text-muted">${av}</td>
                <td class="text-center small text-muted">${ah}</td>
            `;

            tbody.appendChild(tr);

            // Recursão para filhos
            if (linha.children && linha.children.length > 0) {
                linha.children.forEach(child => desenharLinha(child, indentLevel + 1));
            }
        }

        if (dreData.root) {
            desenharLinha(dreData.root);
        } else {
            tbody.innerHTML = '<tr><td colspan="4">Dados inválidos.</td></tr>';
        }
    }

    // --- RENDERIZAÇÃO: INDICADORES ---
    function renderIndicadores(indicadores) {
        const container = document.getElementById('indicadores-container');
        container.innerHTML = '';

        if (!indicadores) {
            container.innerHTML = '<p>Sem dados suficientes para calcular indicadores.</p>';
            return;
        }

        const createCard = (titulo, valor, descricao, corClass = 'primary', sulfixo = '') => {
            return `
                <div class="indicator-card border-${corClass}">
                    <h5>${titulo}</h5>
                    <div class="indicator-value">${valor}${sulfixo}</div>
                    <p class="indicator-desc">${descricao}</p>
                </div>
            `;
        };

        const htmlLiquidez = `
            ${createCard('Liquidez Corrente', indicadores.liquidez.corrente, 'Capacidade de pagar curto prazo (Ideal > 1)', indicadores.liquidez.corrente > 1 ? 'success' : 'warning')}
            ${createCard('Liquidez Seca', indicadores.liquidez.seca, 'Capacidade sem contar estoques', 'info')}
            ${createCard('Liquidez Geral', indicadores.liquidez.geral, 'Solvência a longo prazo', 'primary')}
        `;

        const htmlRentabilidade = `
            ${createCard('Margem Líquida', indicadores.rentabilidade.margemLiquida, 'Lucro Líquido sobre Receita', indicadores.rentabilidade.margemLiquida > 0 ? 'success' : 'danger', '%')}
            ${createCard('ROE', indicadores.rentabilidade.roe, 'Retorno sobre Patrimônio Líquido', indicadores.rentabilidade.roe > 0 ? 'success' : 'danger', '%')}
        `;

        container.innerHTML = htmlLiquidez + htmlRentabilidade;
    }

    // --- Utilitários ---
    function formatMoney(value) {
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
});