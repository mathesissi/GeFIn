import { getLivroRazao, getDRE, getIndicadores, getLivroDiario, getBalancoPatrimonial } from './api.js';
import { initUserProfile, checkAuthRedirect } from './UserProfile.js';

if (!checkAuthRedirect()) {
    throw new Error("Não autenticado");
}

document.addEventListener('DOMContentLoaded', async () => {
    await initUserProfile();

    // Referências DOM
    const reportCards = document.querySelectorAll('.report-card');
    const filterForm = document.getElementById('report-filter-form');
    const reportViewContainer = document.getElementById('report-view-container');
    const reportTitle = document.getElementById('report-title');

    // Mapeamento de Views
    const views = {
        'livro-razao': document.getElementById('livro-razao-view'),
        'livro-diario': document.getElementById('livro-diario-view'),
        'balanco-patrimonial': document.getElementById('balanco-patrimonial-view'),
        'dre': document.getElementById('dre-view'),
        'indicadores': document.getElementById('indicadores-view')
    };

    let currentReportType = null;

    // 1. Seleção de Relatório
    reportCards.forEach(card => {
        card.addEventListener('click', () => {
            reportCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');

            const reportType = card.dataset.report;
            currentReportType = reportType;

            reportTitle.textContent = card.querySelector('h3').textContent;
            reportViewContainer.style.display = 'block';

            Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
            if (views[reportType]) views[reportType].style.display = 'block';

            carregarRelatorio();
        });
    });

    // 2. Filtro (Mês/Ano)
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentReportType) carregarRelatorio();
    });

    // 3. Função Central de Carregamento
    async function carregarRelatorio() {
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;

        try {
            if (typeof showSystemNotification === 'function')
                showSystemNotification('Carregando dados...', 'info', 1000);

            switch (currentReportType) {
                case 'livro-razao':
                    const razao = await getLivroRazao(mes, ano);
                    renderLivroRazao(razao);
                    break;
                case 'livro-diario':
                    const diario = await getLivroDiario(mes, ano);
                    renderLivroDiario(diario);
                    break;
                case 'balanco-patrimonial':
                    const balanco = await getBalancoPatrimonial(mes, ano);
                    renderBalancoPatrimonial(balanco);
                    break;
                case 'dre':
                    const dre = await getDRE(mes, ano);
                    renderDRE(dre);
                    break;
                case 'indicadores':
                    const ind = await getIndicadores(mes, ano);
                    renderIndicadores(ind);
                    break;
            }
        } catch (error) {
            console.error(error);
            if (typeof showSystemNotification === 'function')
                showSystemNotification(`Erro: ${error.message}`, 'error');
        }
    }

    // ==========================================
    // RENDERIZAÇÃO: BALANÇO PATRIMONIAL (CORRIGIDO)
    // ==========================================
    function renderBalancoPatrimonial(dados) {
        // Função interna recursiva para desenhar a árvore
        const renderTreeIntoTable = (tbodyId, tfootId, rootNode, labelTotal) => {
            const tbody = document.getElementById(tbodyId);
            const tfoot = document.getElementById(tfootId);
            tbody.innerHTML = '';
            tfoot.innerHTML = '';

            if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" class="text-muted">Sem dados</td></tr>';
                // Mesmo sem dados, mostra o total zerado
                tfoot.innerHTML = `<tr class="bg-light"><td><strong>${labelTotal}</strong></td><td class="text-right"><strong>${formatMoney(0)}</strong></td></tr>`;
                return 0;
            }

            // Função recursiva que desenha as linhas
            const desenharLinha = (node, indent = 0) => {
                const tr = document.createElement('tr');
                
                const isGroup = node.tipo === 'grupo';
                const padding = (indent * 20) + 'px';
                const styleBold = isGroup ? 'font-weight:bold;' : '';
                
                // Se for nível 0 (Raiz artificial), não desenha a linha, só os filhos
                // Mas se quiser desenhar, pode. Aqui vamos desenhar tudo que está dentro do root.
                
                tr.innerHTML = `
                    <td style="padding-left: ${padding}; ${styleBold}">${node.codigo_conta} - ${node.nome_conta}</td>
                    <td class="text-right" style="${styleBold}">${formatMoney(node.saldo_atual)}</td>
                `;
                tbody.appendChild(tr);

                if (node.children) {
                    node.children.forEach(child => desenharLinha(child, indent + 1));
                }
            };

            // Começamos desenhando os filhos da raiz (para não repetir o título "ATIVO" dentro da tabela)
            rootNode.children.forEach(child => desenharLinha(child, 0));

            // Rodapé com o total da raiz
            tfoot.innerHTML = `
                <tr class="bg-light">
                    <td><strong>${labelTotal}</strong></td>
                    <td class="text-right"><strong>${formatMoney(rootNode.saldo_atual)}</strong></td>
                </tr>
            `;
            
            return rootNode.saldo_atual;
        };

        // Renderiza as 3 seções usando a estrutura de árvore do backend
        const totalAtivo = renderTreeIntoTable('balanco-ativo-tbody', 'balanco-ativo-tfoot', dados.ativo, 'TOTAL ATIVO');
        const totalPassivo = renderTreeIntoTable('balanco-passivo-tbody', 'balanco-passivo-tfoot', dados.passivo, 'TOTAL PASSIVO');
        const totalPL = renderTreeIntoTable('balanco-pl-tbody', 'balanco-pl-tfoot', dados.patrimonioLiquido, 'TOTAL PATRIMÔNIO LÍQUIDO');

        // Adiciona rodapé extra no Passivo somando (Passivo + PL)
        const tfootPassivo = document.getElementById('balanco-passivo-tfoot');
        const rowTotalGeral = document.createElement('tr');
        rowTotalGeral.style.color = 'blue';
        rowTotalGeral.style.backgroundColor = '#eef';
        rowTotalGeral.innerHTML = `
            <td style="padding-top:10px;"><strong>TOTAL PASSIVO + PL</strong></td>
            <td class="text-right" style="padding-top:10px;"><strong>${formatMoney(totalPassivo + totalPL)}</strong></td>
        `;
        tfootPassivo.appendChild(rowTotalGeral);
    }

    // ==========================================
    // OUTRAS RENDERIZAÇÕES (MANTIDAS)
    // ==========================================
    
    function renderLivroRazao(contas) {
        const container = document.getElementById('livro-razao-container');
        container.innerHTML = '';
        if (!contas || contas.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma movimentação encontrada.</p>';
            return;
        }
        contas.forEach(conta => {
            const block = document.createElement('div');
            block.className = 'account-ledger-block mb-4';
            block.innerHTML = `<div class="ledger-header"><h4>${conta.codigo_conta} - ${conta.nome_conta}</h4></div>`;
            
            const table = document.createElement('table');
            table.className = 'data-table ledger-table';
            table.innerHTML = `
                <thead><tr><th>Data</th><th>Histórico</th><th class="text-right">Débito</th><th class="text-right">Crédito</th><th class="text-right">Saldo</th></tr></thead>
                <tbody>
                    <tr class="ledger-initial-balance"><td colspan="2"><strong>Saldo Anterior</strong></td><td></td><td></td><td class="text-right"><strong>${formatMoney(conta.saldo_anterior)}</strong></td></tr>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');
            conta.registros.forEach(reg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${formatDate(reg.data)}</td><td>${reg.descricao}</td><td class="text-right text-danger">${reg.debito ? formatMoney(reg.debito) : ''}</td><td class="text-right text-primary">${reg.credito ? formatMoney(reg.credito) : ''}</td><td class="text-right font-weight-bold">${formatMoney(reg.saldo_acumulado)}</td>`;
                tbody.appendChild(tr);
            });
            tbody.innerHTML += `<tr class="ledger-final-balance"><td colspan="4" class="text-right"><strong>Saldo Final:</strong></td><td class="text-right"><strong>${formatMoney(conta.saldo_final)}</strong></td></tr>`;
            block.appendChild(table);
            container.appendChild(block);
        });
    }

    function renderLivroDiario(lancamentos) {
        const tbody = document.getElementById('livro-diario-tbody');
        tbody.innerHTML = '';
        if (!lancamentos || lancamentos.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">Sem dados.</td></tr>'; return; }
        
        lancamentos.sort((a,b) => new Date(a.data) - new Date(b.data));
        
        lancamentos.forEach(lanc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${formatDate(lanc.data)}</td><td>${lanc.descricao}</td><td colspan="2"></td><td class="text-right">${formatMoney(lanc.valor_total)}</td>`;
            const btn = document.createElement('button'); btn.textContent = '+'; btn.className = 'btn-icon';
            const tdBtn = document.createElement('td'); tdBtn.className = 'text-center'; tdBtn.appendChild(btn);
            tr.appendChild(tdBtn);
            
            btn.onclick = function() {
                const row = this.closest('tr');
                if(row.nextElementSibling && row.nextElementSibling.classList.contains('detail-row')) {
                    row.nextElementSibling.remove(); this.textContent = '+';
                } else {
                    const det = document.createElement('tr'); det.className = 'detail-row bg-light';
                    let html = `<td colspan="6" style="padding:10px"><table style="width:100%; font-size:0.9em"><thead><tr><th>Conta</th><th>Tipo</th><th class="text-right">Valor</th></tr></thead><tbody>`;
                    lanc.partidas.forEach(p => {
                        const cor = p.tipo_partida === 'debito' ? 'text-danger' : 'text-primary';
                        html += `<tr><td>${p.nome_conta || p.id_conta}</td><td class="${cor}">${p.tipo_partida.toUpperCase()}</td><td class="text-right">${formatMoney(p.valor)}</td></tr>`;
                    });
                    html += `</tbody></table></td>`;
                    det.innerHTML = html;
                    row.insertAdjacentElement('afterend', det);
                    this.textContent = '-';
                }
            };
            tbody.appendChild(tr);
        });
    }

    function renderDRE(dreData) {
        const tbody = document.getElementById('dre-tbody');
        tbody.innerHTML = '';
        if (!dreData || !dreData.root) { tbody.innerHTML = '<tr><td colspan="4">Sem dados.</td></tr>'; return; }

        const desenhar = (linha, indent = 0) => {
            const tr = document.createElement('tr');
            const bold = linha.nivel <= 1 ? 'font-weight-bold' : '';
            const cor = linha.valor < 0 && linha.tipo !== 'titulo' ? 'text-danger' : '';
            const val = linha.tipo === 'titulo' ? '' : formatMoney(linha.valor);
            
            tr.innerHTML = `
                <td style="padding-left:${indent*20}px" class="${bold}">${linha.descricao}</td>
                <td class="text-right ${bold} ${cor}">${val}</td>
                <td class="text-center small text-muted">${linha.analiseVertical ? linha.analiseVertical+'%' : '-'}</td>
                <td class="text-center small text-muted">-</td>
            `;
            tbody.appendChild(tr);
            if(linha.children) linha.children.forEach(c => desenhar(c, indent + 1));
        };
        desenhar(dreData.root);
    }

    function renderIndicadores(indicadores) {
        const container = document.getElementById('indicadores-container');
        container.innerHTML = '';
        if (!indicadores) { container.innerHTML = '<p>Sem dados.</p>'; return; }
        
        const card = (t, v, d, c, s='') => `<div class="indicator-card border-${c}"><h5>${t}</h5><div class="indicator-value">${v}${s}</div><p class="indicator-desc">${d}</p></div>`;
        container.innerHTML = 
            card('Liquidez Corrente', indicadores.liquidez.corrente, 'Curto Prazo (>1)', indicadores.liquidez.corrente > 1 ? 'success' : 'warning') +
            card('Margem Líquida', indicadores.rentabilidade.margemLiquida, 'Lucro/Receita', indicadores.rentabilidade.margemLiquida > 0 ? 'success' : 'danger', '%') +
            card('ROE', indicadores.rentabilidade.roe, 'Retorno s/ PL', 'primary', '%');
    }

    // Helpers
    function formatMoney(v) { return Number(v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'}); }
    function formatDate(d) { if(!d) return '-'; return new Date(d).toLocaleDateString('pt-BR', {timeZone:'UTC'}); }
});