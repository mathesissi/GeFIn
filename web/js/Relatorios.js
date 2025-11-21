import { getBalancete, getLancamentos, getDRE } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. REFERÊNCIAS AO DOM
    // ==========================================
    
    // Cards e Filtros
    const reportCards = document.querySelectorAll('.report-card');
    const filterContainer = document.getElementById('filter-container');
    const reportViewContainer = document.getElementById('report-view-container');
    const reportTitle = document.getElementById('report-title');
    const filterForm = document.getElementById('report-filter-form');

    // Views (Containers de cada relatório)
    const balanceteView = document.getElementById('balancete-view');
    const balancoView = document.getElementById('balanco-view');
    const livroDiarioView = document.getElementById('livrodiario-view');
    const dreView = document.getElementById('dre-view');

    // Corpos das Tabelas (Tbody)
    const balanceteTbody = document.getElementById('report-tbody-balancete');
    const balanceteTfoot = document.getElementById('report-tfoot-balancete');
    
    const balancoAtivoTbody = document.getElementById('balanco-ativo-tbody');
    const balancoPassivoTbody = document.getElementById('balanco-passivo-tbody');
    const balancoPlTbody = document.getElementById('balanco-pl-tbody');
    const balancoAtivoTfoot = document.getElementById('balanco-ativo-tfoot');
    const balancoPassivoTfoot = document.getElementById('balanco-passivo-tfoot');
    const balancoPlTfoot = document.getElementById('balanco-pl-tfoot');

    // Tabelas opcionais de Receita/Despesa no Balanço
    let balancoReceitaTbody = document.getElementById('balanco-receita-tbody');
    let balancoDespesaTbody = document.getElementById('balanco-despesa-tbody');

    const livroDiarioTbody = document.getElementById('livrodiario-tbody');
    const dreTbody = document.getElementById('report-tbody-dre');

    let selectedReport = null;

    // ==========================================
    // 2. SELEÇÃO DE RELATÓRIO
    // ==========================================
    reportCards.forEach(card => {
        card.addEventListener('click', () => {
            selectedReport = card.dataset.report;
            
            // Atualiza classe visual 'active'
            reportCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Mostra o filtro para todos os relatórios suportados
            if (['balancete', 'balanco', 'livrodiario', 'dre'].includes(selectedReport)) {
                filterContainer.style.display = 'block';
                reportViewContainer.style.display = 'none'; // Esconde resultado anterior ao trocar
            } else {
                filterContainer.style.display = 'none';
                if (typeof showSystemNotification === 'function') {
                    showSystemNotification("Relatório em desenvolvimento.", "warning");
                }
            }
        });
    });

    // ==========================================
    // 3. GERAÇÃO DE RELATÓRIO (SUBMIT)
    // ==========================================
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const mes = parseInt(document.getElementById('mes').value);
        const ano = parseInt(document.getElementById('ano').value);

        if (!selectedReport) return;

        // Feedback visual de carregamento
        const btnSubmit = filterForm.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = "Gerando...";
        btnSubmit.disabled = true;

        try {
            if (selectedReport === 'dre') {
                const dreData = await getDRE(mes, ano);
                mostrarDRE(dreData, mes, ano);
            } 
            else if (selectedReport === 'livrodiario') {
                const todosLancamentos = await getLancamentos();
                // Filtra no front-end pois a API atual retorna tudo
                const lancamentosFiltrados = todosLancamentos.filter(l => {
                    const dataL = new Date(l.data);
                    return (dataL.getUTCMonth() + 1) === mes && dataL.getUTCFullYear() === ano;
                });
                mostrarLivroDiario(lancamentosFiltrados, mes, ano);
            } 
            else {
                // Balancete e Balanço compartilham a mesma fonte de dados
                const data = await getBalancete(mes, ano);
                const listaContas = data.contas || (Array.isArray(data) ? data : []);
                
                if (selectedReport === 'balancete') {
                    const totais = { 
                        debito: data.total_debitos || 0, 
                        credito: data.total_creditos || 0 
                    };
                    mostrarBalancete(listaContas, totais, mes, ano);
                } else if (selectedReport === 'balanco') {
                    const balancoData = processarBalanco(listaContas);
                    mostrarBalanco(balancoData, mes, ano);
                }
            }

        } catch (error) {
            console.error(error);
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(`Erro ao gerar relatório: ${error.message}`, 'error');
            } else {
                alert(`Erro: ${error.message}`);
            }
        } finally {
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        }
    });

    // ==========================================
    // 4. RENDERIZAÇÃO: DRE (NOVO)
    // ==========================================
    function mostrarDRE(dreData, mes, ano) {
        reportTitle.textContent = `DRE - ${mes}/${ano}`;
        
        // Controle de Visibilidade
        reportViewContainer.style.display = 'block';
        balanceteView.style.display = 'none';
        balancoView.style.display = 'none';
        livroDiarioView.style.display = 'none';
        dreView.style.display = 'block';

        dreTbody.innerHTML = '';

        if (!dreData || !dreData.root) {
            dreTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding: 20px;">Nenhum dado encontrado para o período.</td></tr>';
            return;
        }

        // Função Recursiva para desenhar a árvore
        const renderLinha = (linha, indentacao = 0) => {
            const tr = document.createElement('tr');
            
            // Lógica de Estilo
            // Nível 0 = Resultado Final, Nível 1 = Grandes Grupos -> Negrito
            const isBold = linha.nivel <= 1 || linha.tipo === 'subtotal' || linha.tipo === 'calculo';
            const paddingLeft = indentacao * 20; // Indentação visual (20px por nível)
            
            const estiloTexto = isBold ? 'font-weight: 700;' : 'font-weight: 400;';
            // Se for negativo, pinta de vermelho. Se for título sem valor, cor normal.
            const estiloCor = (linha.valor < 0 && linha.tipo !== 'titulo') ? 'color: #dc3545;' : 'color: inherit;';
            
            // Formatação do Valor
            // Títulos principais (Nível 0 e tipo titulo) geralmente não mostram valor "0,00"
            let valorFormatado = '';
            if (linha.tipo !== 'titulo') {
                valorFormatado = formatMoeda(linha.valor);
            }

            tr.innerHTML = `
                <td style="padding-left: ${paddingLeft}px; ${estiloTexto}">${linha.descricao}</td>
                <td style="text-align: right; ${estiloTexto} ${estiloCor}">${valorFormatado}</td>
            `;
            dreTbody.appendChild(tr);

            // Renderiza os filhos (recursão)
            if (linha.children && linha.children.length > 0) {
                linha.children.forEach(filho => renderLinha(filho, indentacao + 1));
            }
        };

        // Inicia renderização pela raiz
        renderLinha(dreData.root);
    }

    // ==========================================
    // 5. RENDERIZAÇÃO: LIVRO DIÁRIO
    // ==========================================
    function mostrarLivroDiario(lancamentos, mes, ano) {
        reportTitle.textContent = `Livro Diário - ${mes}/${ano}`;
        reportViewContainer.style.display = 'block';
        livroDiarioView.style.display = 'block';
        balanceteView.style.display = 'none';
        balancoView.style.display = 'none';
        dreView.style.display = 'none';

        livroDiarioTbody.innerHTML = '';

        if (!lancamentos || lancamentos.length === 0) {
            livroDiarioTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhum lançamento encontrado.</td></tr>';
            return;
        }

        // Ordena por data
        lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

        lancamentos.forEach(lanc => {
            const tr = document.createElement('tr');
            const dataFormatada = new Date(lanc.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${lanc.descricao}</td>
                <td colspan="2"></td>
                <td style="text-align: right;">${formatMoeda(lanc.valor_total)}</td>
                <td style="text-align: center;">
                    <button class="btn-icon btn-expand" style="cursor:pointer; background:none; border:none; font-weight:bold;">+</button>
                </td>
            `;
            // Guarda os detalhes no elemento DOM
            tr.dataset.partidas = JSON.stringify(lanc.partidas || []);
            livroDiarioTbody.appendChild(tr);

            // Evento Expandir
            const btnExpand = tr.querySelector('.btn-expand');
            btnExpand.addEventListener('click', function() {
                const row = this.closest('tr');
                const nextRow = row.nextElementSibling;

                if (nextRow && nextRow.classList.contains('detail-row')) {
                    nextRow.remove();
                    this.textContent = '+';
                } else {
                    const partidas = JSON.parse(row.dataset.partidas);
                    const detailRow = document.createElement('tr');
                    detailRow.classList.add('detail-row');
                    detailRow.style.backgroundColor = '#f8f9fa';

                    let detalhesHTML = `
                        <td colspan="6" style="padding: 10px 20px;">
                            <table style="width: 100%; font-size: 0.9em;">
                                <thead style="color: #666; border-bottom: 1px solid #ddd;">
                                    <tr>
                                        <th style="text-align: left;">Conta Contábil</th>
                                        <th style="text-align: center;">Tipo</th>
                                        <th style="text-align: right;">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    partidas.forEach(p => {
                        const cor = p.tipo_partida === 'debito' ? '#d9534f' : '#0275d8';
                        // Nota: Idealmente o backend retornaria o nome da conta aqui também.
                        // Por enquanto mostra o ID.
                        detalhesHTML += `
                            <tr>
                                <td>Conta ID: ${p.id_conta}</td> 
                                <td style="text-align: center; color: ${cor}; font-weight:bold;">${p.tipo_partida.toUpperCase()}</td>
                                <td style="text-align: right;">${formatMoeda(p.valor)}</td>
                            </tr>
                        `;
                    });

                    detalhesHTML += `</tbody></table></td>`;
                    detailRow.innerHTML = detalhesHTML;
                    row.insertAdjacentElement('afterend', detailRow);
                    this.textContent = '-';
                }
            });
        });
    }

    // ==========================================
    // 6. RENDERIZAÇÃO: BALANCETE
    // ==========================================
    function mostrarBalancete(contas, totais, mes, ano) {
        reportTitle.textContent = `Balancete - ${mes}/${ano}`;
        reportViewContainer.style.display = 'block';
        balanceteView.style.display = 'block';
        balancoView.style.display = 'none';
        livroDiarioView.style.display = 'none';
        dreView.style.display = 'none';

        balanceteTbody.innerHTML = '';
        
        if (contas.length === 0) {
            balanceteTbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Sem dados.</td></tr>';
            return;
        }

        contas.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.codigo_conta}</td>
                <td>${c.nome_conta}</td>
                <td style="text-align: right;">${formatMoeda(c.total_debito || c.movimento_debito)}</td>
                <td style="text-align: right;">${formatMoeda(c.total_credito || c.movimento_credito)}</td>
            `;
            balanceteTbody.appendChild(tr);
        });

        balanceteTfoot.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: right; font-weight: bold;">TOTAIS:</td>
                <td style="text-align: right; font-weight: bold;">${formatMoeda(totais.debito)}</td>
                <td style="text-align: right; font-weight: bold;">${formatMoeda(totais.credito)}</td>
            </tr>
        `;
    }

    // ==========================================
    // 7. RENDERIZAÇÃO: BALANÇO PATRIMONIAL
    // ==========================================
    function mostrarBalanco(dados, mes, ano) {
        reportTitle.textContent = `Balanço Patrimonial - ${mes}/${ano}`;
        reportViewContainer.style.display = 'block';
        balancoView.style.display = 'block';
        balanceteView.style.display = 'none';
        livroDiarioView.style.display = 'none';
        dreView.style.display = 'none';

        const preencher = (tbody, lista) => {
            tbody.innerHTML = '';
            let total = 0;
            lista.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${c.nome_conta}</td><td style="text-align:right">${formatMoeda(c.saldo)}</td>`;
                tbody.appendChild(tr);
                total += c.saldo;
            });
            return total;
        };

        const totalAtivo = preencher(balancoAtivoTbody, dados.Ativo);
        const totalPassivo = preencher(balancoPassivoTbody, dados.Passivo);
        const totalPL = preencher(balancoPlTbody, dados.PatrimonioLiquido);
        
        // Se existirem no HTML
        if(balancoReceitaTbody) preencher(balancoReceitaTbody, dados.Receita);
        if(balancoDespesaTbody) preencher(balancoDespesaTbody, dados.Despesa);

        balancoAtivoTfoot.innerHTML = `<tr><td><strong>TOTAL ATIVO</strong></td><td style="text-align:right"><strong>${formatMoeda(totalAtivo)}</strong></td></tr>`;
        balancoPassivoTfoot.innerHTML = `<tr><td><strong>TOTAL PASSIVO</strong></td><td style="text-align:right"><strong>${formatMoeda(totalPassivo)}</strong></td></tr>`;
        balancoPlTfoot.innerHTML = `
            <tr><td><strong>TOTAL PL</strong></td><td style="text-align:right"><strong>${formatMoeda(totalPL)}</strong></td></tr>
            <tr><td style="color:blue"><strong>PASSIVO + PL</strong></td><td style="text-align:right; color:blue"><strong>${formatMoeda(totalPassivo + totalPL)}</strong></td></tr>
        `;
    }

    // --- Helpers ---

    function processarBalanco(contas) {
        const estrutura = { Ativo: [], Passivo: [], PatrimonioLiquido: [], Receita: [], Despesa: [] };
        contas.forEach(c => {
            const codigo = String(c.codigo_conta);
            // Cálculo simplificado de saldo acumulado (deveria vir do backend com saldo anterior, mas serve para MVP)
            const debito = Number(c.total_debito || c.movimento_debito || 0);
            const credito = Number(c.total_credito || c.movimento_credito || 0);
            let saldo = 0;

            if (codigo.startsWith('1')) { // Ativo (Devedora)
                saldo = debito - credito;
                estrutura.Ativo.push({ ...c, saldo });
            } else if (codigo.startsWith('2')) { // Passivo (Credora)
                saldo = credito - debito;
                if (c.nome_conta.toLowerCase().includes('patrimônio') || c.nome_conta.toLowerCase().includes('capital') || codigo.startsWith('2.3')) {
                    estrutura.PatrimonioLiquido.push({ ...c, saldo });
                } else {
                    estrutura.Passivo.push({ ...c, saldo });
                }
            } else if (codigo.startsWith('3')) { // Receita (Credora)
                 saldo = credito - debito;
                 estrutura.Receita.push({ ...c, saldo });
            } else if (codigo.startsWith('4')) { // Despesa (Devedora)
                 saldo = debito - credito;
                 estrutura.Despesa.push({ ...c, saldo });
            }
        });
        return estrutura;
    }

    function formatMoeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
});