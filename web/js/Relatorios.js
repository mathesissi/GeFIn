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

            // Título e Visibilidade
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
                    // Busca dados da API
                    const diario = await getLivroDiario(mes, ano);
                    renderLivroDiario(diario);
                    break;
                case 'balanco-patrimonial':
                    // Busca dados da API
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
    // RENDERIZAÇÃO: LIVRO RAZÃO
    // ==========================================
    function renderLivroRazao(contas) {
        const container = document.getElementById('livro-razao-container');
        container.innerHTML = '';

        if (!contas || contas.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma movimentação encontrada.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        contas.forEach(conta => {
            const block = document.createElement('div');
            block.className = 'account-ledger-block mb-4';

            const header = document.createElement('div');
            header.className = 'ledger-header';
            header.innerHTML = `<h4>${conta.codigo_conta} - ${conta.nome_conta}</h4>`;

            const table = document.createElement('table');
            table.className = 'data-table ledger-table';
            table.innerHTML = `
                <thead>
                    <tr><th width="15%">Data</th><th width="45%">Histórico</th><th width="13%" class="text-right">Débito</th><th width="13%" class="text-right">Crédito</th><th width="14%" class="text-right">Saldo</th></tr>
                </thead>
                <tbody>
                    <tr class="ledger-initial-balance"><td colspan="2"><strong>Saldo Anterior</strong></td><td></td><td></td><td class="text-right"><strong>${formatMoney(conta.saldo_anterior)}</strong></td></tr>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');

            conta.registros.forEach(reg => {
                const tr = document.createElement('tr');
                // Segurança: textContent para dados do usuário
                const tdData = document.createElement('td'); tdData.textContent = formatDate(reg.data);
                const tdDesc = document.createElement('td'); tdDesc.textContent = reg.descricao;
                const tdDeb = document.createElement('td'); tdDeb.className = 'text-right text-danger'; tdDeb.textContent = reg.debito > 0 ? formatMoney(reg.debito) : '';
                const tdCred = document.createElement('td'); tdCred.className = 'text-right text-primary'; tdCred.textContent = reg.credito > 0 ? formatMoney(reg.credito) : '';
                const tdSaldo = document.createElement('td'); tdSaldo.className = 'text-right font-weight-bold'; tdSaldo.textContent = formatMoney(reg.saldo_acumulado);

                tr.append(tdData, tdDesc, tdDeb, tdCred, tdSaldo);
                tbody.appendChild(tr);
            });

            const trFinal = document.createElement('tr');
            trFinal.className = 'ledger-final-balance';
            trFinal.innerHTML = `<td colspan="4" class="text-right"><strong>Saldo Final:</strong></td><td class="text-right"><strong>${formatMoney(conta.saldo_final)}</strong></td>`;
            tbody.appendChild(trFinal);

            block.append(header, table);
            fragment.appendChild(block);
        });
        container.appendChild(fragment);
    }

    // ==========================================
    // RENDERIZAÇÃO: LIVRO DIÁRIO (Vindo do Back)
    // ==========================================
    function renderLivroDiario(lancamentos) {
        const tbody = document.getElementById('livro-diario-tbody');
        tbody.innerHTML = '';

        if (!lancamentos || lancamentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center p-3">Nenhum lançamento no período.</td></tr>';
            return;
        }

        // Ordenação
        lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

        const fragment = document.createDocumentFragment();

        lancamentos.forEach(lanc => {
            const tr = document.createElement('tr');
            
            // Dados principais
            const tdData = document.createElement('td'); tdData.textContent = formatDate(lanc.data);
            const tdDesc = document.createElement('td'); tdDesc.textContent = lanc.descricao;
            const tdEmpty = document.createElement('td'); tdEmpty.colSpan = 2; // Espaço
            const tdValor = document.createElement('td'); tdValor.className = 'text-right'; tdValor.textContent = formatMoney(lanc.valor_total);
            
            // Botão Expandir
            const tdAction = document.createElement('td'); 
            tdAction.className = 'text-center';
            const btn = document.createElement('button');
            btn.className = 'btn-icon btn-expand';
            btn.textContent = '+';
            btn.style.cursor = 'pointer';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.fontWeight = 'bold';
            
            // Lógica de Expansão (Importada do back.js e melhorada)
            btn.onclick = function() {
                const row = this.closest('tr');
                const nextRow = row.nextElementSibling;

                if (nextRow && nextRow.classList.contains('detail-row')) {
                    nextRow.remove();
                    this.textContent = '+';
                } else {
                    const detailRow = document.createElement('tr');
                    detailRow.classList.add('detail-row');
                    detailRow.style.backgroundColor = '#f8f9fa';

                    const cell = document.createElement('td');
                    cell.colSpan = 6;
                    cell.style.padding = '10px 20px';

                    const subTable = document.createElement('table');
                    subTable.style.width = '100%';
                    subTable.style.fontSize = '0.9em';
                    subTable.innerHTML = `
                        <thead style="color: #666; border-bottom: 1px solid #ddd;">
                            <tr><th class="text-left">Conta Contábil</th><th class="text-center">Tipo</th><th class="text-right">Valor</th></tr>
                        </thead>
                        <tbody></tbody>
                    `;
                    
                    const subBody = subTable.querySelector('tbody');
                    
                    // Renderiza partidas
                    (lanc.partidas || []).forEach(p => {
                        const subTr = document.createElement('tr');
                        const cor = p.tipo_partida === 'debito' ? '#d9534f' : '#0275d8'; // Vermelho/Azul
                        
                        subTr.innerHTML = `
                            <td>${p.nome_conta || 'Conta ID: ' + p.id_conta}</td>
                            <td class="text-center" style="color: ${cor}; font-weight:bold;">${p.tipo_partida.toUpperCase()}</td>
                            <td class="text-right">${formatMoney(p.valor)}</td>
                        `;
                        subBody.appendChild(subTr);
                    });

                    cell.appendChild(subTable);
                    detailRow.appendChild(cell);
                    row.insertAdjacentElement('afterend', detailRow);
                    this.textContent = '-';
                }
            };

            tdAction.appendChild(btn);
            tr.append(tdData, tdDesc, tdEmpty, tdValor, tdAction);
            fragment.appendChild(tr);
        });

        tbody.appendChild(fragment);
    }

    // ==========================================
    // RENDERIZAÇÃO: BALANÇO PATRIMONIAL
    // ==========================================
    function renderBalancoPatrimonial(dados) {
        // Se a API retornar formato árvore (como sugeri no backend), usamos direto.
        // Se retornar lista plana (como no back.js antigo), processamos.
        let balancoData = dados;
        if (Array.isArray(dados) || (dados.contas && Array.isArray(dados.contas))) {
             // Lógica de conversão do back.js
             balancoData = processarBalancoPlano(dados.contas || dados);
        }

        const preencherTabela = (tbodyId, tfootId, listaContas, tituloTotal) => {
            const tbody = document.getElementById(tbodyId);
            const tfoot = document.getElementById(tfootId);
            tbody.innerHTML = '';
            tfoot.innerHTML = '';

            let total = 0;
            const fragment = document.createDocumentFragment();

            if (!listaContas || listaContas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" class="text-muted">Sem dados</td></tr>';
                return 0;
            }

            listaContas.forEach(c => {
                const tr = document.createElement('tr');
                
                // Indentação baseada no nível (se existir)
                const padding = c.nivel ? (c.nivel * 15) + 'px' : '0px';
                const styleBold = (c.tipo === 'grupo' || c.tipo === 'total') ? 'font-weight:bold' : '';

                const tdNome = document.createElement('td');
                tdNome.style.paddingLeft = padding;
                tdNome.className = styleBold;
                tdNome.textContent = c.nome_conta;

                const tdValor = document.createElement('td');
                tdValor.className = `text-right ${styleBold}`;
                // Usa saldo_atual ou saldo (dependendo do formato da API)
                const valor = c.saldo_atual !== undefined ? c.saldo_atual : c.saldo;
                tdValor.textContent = formatMoney(valor);

                tr.append(tdNome, tdValor);
                fragment.appendChild(tr);
                
                // Se for lista plana, soma aqui. Se for árvore, o total vem do root.
                if (c.saldo !== undefined) total += c.saldo;
            });

            tbody.appendChild(fragment);

            // Se for árvore, o total geralmente já está calculado no nó raiz, 
            // mas aqui desenhamos o rodapé para garantir.
            if (tituloTotal) {
                // Se vier da árvore, pegamos o valor do root, senão usamos a soma
                const valorFinal = (listaContas.length === 1 && listaContas[0].tipo === 'grupo') 
                                    ? listaContas[0].saldo_atual 
                                    : total;
                
                tfoot.innerHTML = `
                    <tr class="bg-light">
                        <td><strong>${tituloTotal}</strong></td>
                        <td class="text-right"><strong>${formatMoney(valorFinal)}</strong></td>
                    </tr>
                `;
                return valorFinal;
            }
            return total;
        };

        // Renderiza
        // Nota: Adapta para aceitar tanto a estrutura {ativo: [], passivo: []} quanto {Ativo: [], Passivo: []}
        const listaAtivo = balancoData.ativo || balancoData.Ativo || [];
        const listaPassivo = balancoData.passivo || balancoData.Passivo || [];
        const listaPL = balancoData.patrimonioLiquido || balancoData.PatrimonioLiquido || [];

        // Caso seja árvore (backend novo), listaAtivo é um objeto root, transformamos em array para o loop
        const arrAtivo = Array.isArray(listaAtivo) ? listaAtivo : [listaAtivo];
        const arrPassivo = Array.isArray(listaPassivo) ? listaPassivo : [listaPassivo];
        // Se o PL vier separado (formato antigo)
        const arrPL = Array.isArray(listaPL) ? listaPL : [listaPL];

        const totalAtivo = preencherTabela('balanco-ativo-tbody', 'balanco-ativo-tfoot', arrAtivo, 'TOTAL ATIVO');
        const totalPassivo = preencherTabela('balanco-passivo-tbody', 'balanco-passivo-tfoot', arrPassivo, 'TOTAL PASSIVO');
        const totalPL = preencherTabela('balanco-pl-tbody', 'balanco-pl-tfoot', arrPL, 'TOTAL PL');
        
        // Rodapé Extra somando Passivo + PL (se estiverem separados)
        if (arrPL.length > 0) {
            const tfootPassivo = document.getElementById('balanco-passivo-tfoot');
            const row = document.createElement('tr');
            row.style.color = 'blue';
            row.innerHTML = `<td><strong>PASSIVO + PL</strong></td><td class="text-right"><strong>${formatMoney(totalPassivo + totalPL)}</strong></td>`;
            tfootPassivo.appendChild(row);
        }
    }

    // ==========================================
    // RENDERIZAÇÃO: DRE
    // ==========================================
    function renderDRE(dreData) {
        const tbody = document.getElementById('dre-tbody');
        tbody.innerHTML = '';

        function desenharLinha(linha, indentLevel = 0) {
            const tr = document.createElement('tr');
            const isTitle = linha.tipo === 'titulo';
            const isSubtotal = linha.tipo === 'subtotal' || linha.tipo === 'calculo';
            
            let descClass = '';
            if (isTitle) descClass = 'font-weight-bold text-uppercase';
            else if (isSubtotal) descClass = 'font-weight-bold';
            
            const paddingLeft = indentLevel * 20 + 'px';
            const av = linha.analiseVertical ? `${linha.analiseVertical}%` : '-';
            const ah = linha.analiseHorizontal ? `${linha.analiseHorizontal}%` : '-';
            const cor = (linha.valor < 0 && !isTitle) ? 'text-danger' : '';

            tr.innerHTML = `
                <td style="padding-left: ${paddingLeft};" class="${descClass}">${linha.descricao}</td>
                <td class="text-right ${descClass} ${cor}">${isTitle ? '' : formatMoney(linha.valor)}</td>
                <td class="text-center small text-muted">${av}</td>
                <td class="text-center small text-muted">${ah}</td>
            `;
            tbody.appendChild(tr);

            if (linha.children && linha.children.length > 0) {
                linha.children.forEach(child => desenharLinha(child, indentLevel + 1));
            }
        }

        if (dreData && dreData.root) {
            desenharLinha(dreData.root);
        } else {
            tbody.innerHTML = '<tr><td colspan="4">Dados inválidos.</td></tr>';
        }
    }

    // ==========================================
    // RENDERIZAÇÃO: INDICADORES
    // ==========================================
    function renderIndicadores(indicadores) {
        const container = document.getElementById('indicadores-container');
        container.innerHTML = '';

        if (!indicadores) {
            container.innerHTML = '<p>Sem dados suficientes.</p>';
            return;
        }

        const createCard = (titulo, valor, descricao, corClass = 'primary', sulfixo = '') => `
            <div class="indicator-card border-${corClass}">
                <h5>${titulo}</h5>
                <div class="indicator-value">${valor}${sulfixo}</div>
                <p class="indicator-desc">${descricao}</p>
            </div>
        `;

        const html = `
            ${createCard('Liquidez Corrente', indicadores.liquidez.corrente, 'Capacidade curto prazo (>1)', indicadores.liquidez.corrente > 1 ? 'success' : 'warning')}
            ${createCard('Liquidez Geral', indicadores.liquidez.geral, 'Longo prazo', 'primary')}
            ${createCard('Margem Líquida', indicadores.rentabilidade.margemLiquida, 'Lucro Líquido / Receita', indicadores.rentabilidade.margemLiquida > 0 ? 'success' : 'danger', '%')}
            ${createCard('ROE', indicadores.rentabilidade.roe, 'Retorno sobre PL', indicadores.rentabilidade.roe > 0 ? 'success' : 'danger', '%')}
        `;
        container.innerHTML = html;
    }

    // ==========================================
    // HELPERS
    // ==========================================
    
    // Função legada do back.js para processar Balancete em Balanço (se necessário)
    function processarBalancoPlano(contas) {
        const estrutura = { Ativo: [], Passivo: [], PatrimonioLiquido: [] };
        contas.forEach(c => {
            const codigo = String(c.codigo_conta);
            const debito = Number(c.total_debito || c.movimento_debito || 0);
            const credito = Number(c.total_credito || c.movimento_credito || 0);
            let saldo = 0;

            if (codigo.startsWith('1')) { // Ativo
                saldo = debito - credito;
                estrutura.Ativo.push({ ...c, saldo });
            } else if (codigo.startsWith('2')) { // Passivo/PL
                saldo = credito - debito;
                if (c.nome_conta.toLowerCase().includes('patrimônio') || codigo.startsWith('2.3')) {
                    estrutura.PatrimonioLiquido.push({ ...c, saldo });
                } else {
                    estrutura.Passivo.push({ ...c, saldo });
                }
            }
        });
        return estrutura;
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
});