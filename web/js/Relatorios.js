import { getBalancete, getBalancoPatrimonial } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const reportCards = document.querySelectorAll('.report-card');
    const filterContainer = document.getElementById('filter-container');
    const reportViewContainer = document.getElementById('report-view-container');
    const filterForm = document.getElementById('report-filter-form');
    const reportTitle = document.getElementById('report-title');

    const balanceteView = document.getElementById('balancete-view');
    const balancoView = document.getElementById('balanco-view');

    const hideAllViews = () => {
        if (reportViewContainer) reportViewContainer.style.display = 'none';
        if (balanceteView) balanceteView.style.display = 'none';
        if (balancoView) balancoView.style.display = 'none';
    };

    reportCards.forEach(card => {
        card.addEventListener('click', () => {
            hideAllViews();
            if (filterContainer) filterContainer.style.display = 'block';
            if (filterForm) filterForm.dataset.reportType = card.dataset.report;
        });
    });

    if (filterForm) {
        filterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reportType = filterForm.dataset.reportType;
            const mes = document.getElementById('mes').value;
            const ano = document.getElementById('ano').value;
            const mesTexto = document.getElementById('mes').options[document.getElementById('mes').selectedIndex].text;
            
            hideAllViews();
            if (reportViewContainer) reportViewContainer.style.display = 'block';

            try {
                if (reportType === 'balancete') {
                    if (reportTitle) reportTitle.innerText = `Balancete de Verificação - ${mesTexto}/${ano}`;
                    const data = await getBalancete(mes, ano);
                    renderBalancete(data);
                    if (balanceteView) balanceteView.style.display = 'block';
                } else if (reportType === 'balanco') {
                    if (reportTitle) reportTitle.innerText = `Balanço Patrimonial - ${mesTexto}/${ano}`;
                    const data = await getBalancoPatrimonial(mes, ano);
                    renderBalancoPatrimonial(data);
                    if (balancoView) balancoView.style.display = 'block';
                }
            } catch (error) {
                alert('Não foi possível gerar o relatório. Verifique o console para mais detalhes.');
                console.error(error);
            }
        });
    }
    
    const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    function renderBalancete(dados) {
        const reportTbody = document.getElementById('report-tbody-balancete');
        const reportTfoot = document.getElementById('report-tfoot-balancete');
        if (!reportTbody || !reportTfoot) return;
        reportTbody.innerHTML = '';
        let totalDebito = 0, totalCredito = 0;
        dados.forEach(conta => {
            const saldo = conta.saldo_final;
            let debito = saldo > 0 ? saldo : 0;
            let credito = saldo < 0 ? -saldo : 0;
            totalDebito += debito;
            totalCredito += credito;
            if (Math.abs(saldo) < 0.01) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${conta.codigo_conta}</td><td>${conta.nome_conta}</td><td style="text-align: right;">${debito > 0 ? formatCurrency(debito) : ''}</td><td style="text-align: right;">${credito > 0 ? formatCurrency(credito) : ''}</td>`;
            reportTbody.appendChild(tr);
        });
        reportTfoot.innerHTML = `<tr style="font-weight: bold; background-color: var(--bg-main);"><td colspan="2">TOTAIS</td><td style="text-align: right;">${formatCurrency(totalDebito)}</td><td style="text-align: right;">${formatCurrency(totalCredito)}</td></tr>`;
    }

    function renderBalancoPatrimonial(data) {
        if(!balancoView) return;
        
        const createRows = (items) => items.map(item => `<tr><td>${item.nome}</td><td style="text-align:right;">${formatCurrency(item.saldo)}</td></tr>`).join('');
        
        balancoView.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr><th colspan="2">ATIVO</th></tr></thead>
                        <tbody>
                            <tr><td colspan="2" style="font-weight:bold; background-color: #f0f0f0;">Ativo Circulante</td></tr>
                            ${createRows(data.ativo.circulante)}
                            <tr><td colspan="2" style="font-weight:bold; background-color: #f0f0f0;">Ativo Não Circulante</td></tr>
                            ${createRows(data.ativo.naoCirculante)}
                        </tbody>
                        <tfoot><tr style="font-weight:bold;"><td>Total do Ativo</td><td style="text-align:right;">${formatCurrency(data.ativo.total)}</td></tr></tfoot>
                    </table>
                </div>
                <div>
                    <div class="table-container" style="margin-bottom: 2rem;">
                        <table class="data-table">
                            <thead><tr><th colspan="2">PASSIVO</th></tr></thead>
                            <tbody>
                                <tr><td colspan="2" style="font-weight:bold; background-color: #f0f0f0;">Passivo Circulante</td></tr>
                                ${createRows(data.passivo.circulante)}
                                <tr><td colspan="2" style="font-weight:bold; background-color: #f0f0f0;">Passivo Não Circulante</td></tr>
                                ${createRows(data.passivo.naoCirculante)}
                            </tbody>
                            <tfoot><tr style="font-weight:bold;"><td>Total do Passivo</td><td style="text-align:right;">${formatCurrency(data.passivo.total)}</td></tr></tfoot>
                        </table>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th colspan="2">PATRIMÔNIO LÍQUIDO</th></tr></thead>
                            <tbody>${createRows(data.patrimonioLiquido.contas)}</tbody>
                            <tfoot><tr style="font-weight:bold;"><td>Total do Patrimônio Líquido</td><td style="text-align:right;">${formatCurrency(data.patrimonioLiquido.total)}</td></tr></tfoot>
                        </table>
                    </div>
                </div>
            </div>
            <div class="table-container" style="margin-top: 2rem;">
                <table class="data-table">
                    <tbody>
                        <tr style="font-weight:bold;"><td >Total do Ativo</td><td style="text-align:right;">${formatCurrency(data.totais.totalAtivo)}</td></tr>
                        <tr style="font-weight:bold;"><td>Total do Passivo + PL</td><td style="text-align:right;">${formatCurrency(data.totais.totalPassivoPL)}</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }
});