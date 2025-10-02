import { getBalancete } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const reportCards = document.querySelectorAll('.report-card');
    const filterContainer = document.getElementById('filter-container');
    const reportViewContainer = document.getElementById('report-view-container');
    const filterForm = document.getElementById('report-filter-form');
    const reportTitle = document.getElementById('report-title');
    const reportTbody = document.querySelector('#report-table tbody');
    const reportTfoot = document.querySelector('#report-table tfoot');

    function resetView() {
        reportViewContainer.style.display = 'none';
    }
    
    reportCards.forEach(card => {
        card.addEventListener('click', () => {
            resetView();
            filterContainer.style.display = 'block';
            filterForm.dataset.reportType = card.dataset.report;
        });
    });

    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const reportType = filterForm.dataset.reportType;
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;
        
        if (reportType !== 'balancete') {
            alert('Apenas o Balancete de Verificação está funcional no momento.');
            return;
        }

        try {
            const dadosBalancete = await getBalancete(mes, ano);
            const mesTexto = document.getElementById('mes').options[document.getElementById('mes').selectedIndex].text;
            
            reportTitle.innerText = `Balancete de Verificação - ${mesTexto}/${ano}`;
            
            renderBalancete(dadosBalancete);

            reportViewContainer.style.display = 'block';
        } catch (error) {
            // Erro já tratado
        }
    });
    
    function renderBalancete(dados) {
        reportTbody.innerHTML = '';
        let totalDebito = 0;
        let totalCredito = 0;

        dados.forEach(item => {
            const saldoDevedor = item.saldo_final > item.saldo_inicial ? (item.saldo_final - item.saldo_inicial) : 0;
            const saldoCredor = item.saldo_final < item.saldo_inicial ? (item.saldo_inicial - item.saldo_final) : 0;

            totalDebito += saldoDevedor;
            totalCredito += saldoCredor;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id_conta}</td> 
                <td>Conta ${item.id_conta}</td>
                <td style="text-align: right;">${saldoDevedor > 0 ? `R$ ${saldoDevedor.toFixed(2)}` : ''}</td>
                <td style="text-align: right;">${saldoCredor > 0 ? `R$ ${saldoCredor.toFixed(2)}` : ''}</td>
            `;
            reportTbody.appendChild(tr);
        });

        reportTfoot.innerHTML = `
            <tr style="font-weight: bold; background-color: var(--bg-main);">
                <td colspan="2">TOTAIS</td>
                <td style="text-align: right;">R$ ${totalDebito.toFixed(2)}</td>
                <td style="text-align: right;">R$ ${totalCredito.toFixed(2)}</td>
            </tr>
        `;
    }
});