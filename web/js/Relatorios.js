// Relatorios.js

const reportCards = document.querySelectorAll('.report-card');
const filterContainer = document.getElementById('filter-container');
const reportViewContainer = document.getElementById('report-view-container');
const reportTitle = document.getElementById('report-title');

const balanceteView = document.getElementById('balancete-view');
const reportTbody = document.getElementById('report-tbody-balancete');
const reportTfoot = document.getElementById('report-tfoot-balancete');

const balancoView = document.getElementById('balanco-view');
const balancoAtivoTbody = document.getElementById('balanco-ativo-tbody');
const balancoPassivoTbody = document.getElementById('balanco-passivo-tbody');
const balancoPlTbody = document.getElementById('balanco-pl-tbody');

const balancoAtivoTfoot = document.getElementById('balanco-ativo-tfoot');
const balancoPassivoTfoot = document.getElementById('balanco-passivo-tfoot');
const balancoPlTfoot = document.getElementById('balanco-pl-tfoot');

// Criar tbody para Receita e Despesa
let balancoReceitaTbody = document.getElementById('balanco-receita-tbody');
let balancoDespesaTbody = document.getElementById('balanco-despesa-tbody');

// Se não existirem no HTML, criamos dinamicamente
if (!balancoReceitaTbody) {
  const receitaTable = document.createElement('table');
  receitaTable.className = 'data-table';
  receitaTable.innerHTML = `
    <thead><tr><th colspan="2">RECEITA</th></tr></thead>
    <tbody id="balanco-receita-tbody"></tbody>
  `;
  balancoView.appendChild(receitaTable);
  balancoReceitaTbody = document.getElementById('balanco-receita-tbody');
}

if (!balancoDespesaTbody) {
  const despesaTable = document.createElement('table');
  despesaTable.className = 'data-table';
  despesaTable.innerHTML = `
    <thead><tr><th colspan="2">DESPESA</th></tr></thead>
    <tbody id="balanco-despesa-tbody"></tbody>
  `;
  balancoView.appendChild(despesaTable);
  balancoDespesaTbody = document.getElementById('balanco-despesa-tbody');
}

let selectedReport = null;

// Seleção do relatório
reportCards.forEach(card => {
  card.addEventListener('click', () => {
    selectedReport = card.dataset.report;
    reportCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    if (selectedReport === 'balancete' || selectedReport === 'balanco') {
      filterContainer.style.display = 'block';
      reportViewContainer.style.display = 'none';
    } else {
      filterContainer.style.display = 'none';
      reportViewContainer.style.display = 'none';
    }
  });
});

// Submissão do filtro
const filterForm = document.getElementById('report-filter-form');
filterForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const mes = parseInt(document.getElementById('mes').value);
  const ano = parseInt(document.getElementById('ano').value);

  try {
    const baseUrl = window.location.origin;

    if (selectedReport === 'balancete') {
      const response = await fetch(`${baseUrl}/balancete?mes=${mes}&ano=${ano}`);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      mostrarBalancete(data, mes, ano);
    }

    if (selectedReport === 'balanco') {
      const response = await fetch(`${baseUrl}/balanco?mes=${mes}&ano=${ano}`);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();

      // Passa o objeto "balanco" para a função
      mostrarBalanco(data.balanco || {}, mes, ano);
    }

  } catch (error) {
    alert(`Erro ao gerar relatório: ${error.message}`);
    console.error(error);
  }
});

// =====================
// Função para preencher o Balancete
// =====================
function mostrarBalancete(balancete, mes, ano) {
  reportTitle.textContent = `Balancete de Verificação - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'block';
  balancoView.style.display = 'none';

  reportTbody.innerHTML = '';
  reportTfoot.innerHTML = '';

  balancete.contas.forEach(conta => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${conta.codigo_conta}</td>
      <td>${conta.nome_conta}</td>
      <td style="text-align: right;">${Number(conta.total_debito || 0).toFixed(2)}</td>
      <td style="text-align: right;">${Number(conta.total_credito || 0).toFixed(2)}</td>
    `;
    reportTbody.appendChild(tr);
  });

  const trFoot = document.createElement('tr');
  trFoot.innerHTML = `
    <td colspan="2" style="text-align: right; font-weight: bold;">Totais:</td>
    <td style="text-align: right; font-weight: bold;">${balancete.total_debitos.toFixed(2)}</td>
    <td style="text-align: right; font-weight: bold;">${balancete.total_creditos.toFixed(2)}</td>
  `;
  reportTfoot.appendChild(trFoot);
}

// =====================
// Função para preencher o Balanço Patrimonial
// =====================
function mostrarBalanco(balanco, mes, ano) {
  reportTitle.textContent = `Balanço Patrimonial - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'none';
  balancoView.style.display = 'block';

  // Limpa os TBody
  balancoAtivoTbody.innerHTML = '';
  balancoPassivoTbody.innerHTML = '';
  balancoPlTbody.innerHTML = '';
  balancoReceitaTbody.innerHTML = '';
  balancoDespesaTbody.innerHTML = '';

  // Totais
  let totalAtivo = 0;
  let totalPassivo = 0;
  let totalPL = 0;
  let totalReceita = 0;
  let totalDespesa = 0;

  // Itera sobre cada tipo de conta
  (balanco.Ativo || []).forEach(conta => {
    const saldoInicial = Number(conta.saldo_inicial || 0);
    const saldoFinal = Number(conta.saldo_final || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${conta.nome_conta}</td>
      <td style="text-align: right;">Saldo Inicial: ${saldoInicial.toFixed(2)} | Saldo Final: ${saldoFinal.toFixed(2)}</td>
    `;
    balancoAtivoTbody.appendChild(tr);
    totalAtivo += saldoFinal;
  });

  (balanco.Passivo || []).forEach(conta => {
    const saldoInicial = Number(conta.saldo_inicial || 0);
    const saldoFinal = Number(conta.saldo_final || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${conta.nome_conta}</td>
      <td style="text-align: right;">Saldo Inicial: ${saldoInicial.toFixed(2)} | Saldo Final: ${saldoFinal.toFixed(2)}</td>
    `;
    balancoPassivoTbody.appendChild(tr);
    totalPassivo += saldoFinal;
  });

  (balanco["Patrimonio Liquido"] || []).forEach(conta => {
    const saldoInicial = Number(conta.saldo_inicial || 0);
    const saldoFinal = Number(conta.saldo_final || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${conta.nome_conta}</td>
      <td style="text-align: right;">Saldo Inicial: ${saldoInicial.toFixed(2)} | Saldo Final: ${saldoFinal.toFixed(2)}</td>
    `;
    balancoPlTbody.appendChild(tr);
    totalPL += saldoFinal;
  });

  (balanco.Receita || []).forEach(conta => {
    const saldoFinal = Number(conta.saldo_final || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${conta.nome_conta}</td><td style="text-align:right;">${saldoFinal.toFixed(2)}</td>`;
    balancoReceitaTbody.appendChild(tr);
    totalReceita += saldoFinal;
  });

  (balanco.Despesa || []).forEach(conta => {
    const saldoFinal = Number(conta.saldo_final || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${conta.nome_conta}</td><td style="text-align:right;">${saldoFinal.toFixed(2)}</td>`;
    balancoDespesaTbody.appendChild(tr);
    totalDespesa += saldoFinal;
  });

  // Totais nos rodapés
  balancoAtivoTfoot.innerHTML = `<tr><td style="font-weight:bold;">Total Ativo:</td><td style="text-align:right; font-weight:bold;">${totalAtivo.toFixed(2)}</td></tr>`;
  balancoPassivoTfoot.innerHTML = `<tr><td style="font-weight:bold;">Total Passivo:</td><td style="text-align:right; font-weight:bold;">${totalPassivo.toFixed(2)}</td></tr>`;
  balancoPlTfoot.innerHTML = `<tr><td style="font-weight:bold;">Total Patrimônio Líquido:</td><td style="text-align:right; font-weight:bold;">${totalPL.toFixed(2)}</td></tr>`;

  // Total Passivo + PL
  const trTotalPassivoPL = document.createElement('tr');
  trTotalPassivoPL.innerHTML = `<td style="font-weight:bold;">Total Passivo + PL:</td>
                                 <td style="text-align:right; font-weight:bold;">${(totalPassivo + totalPL).toFixed(2)}</td>`;
  balancoPlTbody.appendChild(trTotalPassivoPL);

  // Totais de Receita e Despesa
  const trTotalReceita = document.createElement('tr');
  trTotalReceita.innerHTML = `<td style="font-weight:bold;">Total Receita:</td>
                              <td style="text-align:right; font-weight:bold;">${totalReceita.toFixed(2)}</td>`;
  balancoReceitaTbody.appendChild(trTotalReceita);

  const trTotalDespesa = document.createElement('tr');
  trTotalDespesa.innerHTML = `<td style="font-weight:bold;">Total Despesa:</td>
                              <td style="text-align:right; font-weight:bold;">${totalDespesa.toFixed(2)}</td>`;
  balancoDespesaTbody.appendChild(trTotalDespesa);

  // Resultado do período (Receita - Despesa)
  const trResultado = document.createElement('tr');
  trResultado.innerHTML = `<td style="font-weight:bold;">Resultado do Período:</td>
                           <td style="text-align:right; font-weight:bold;">${(totalReceita - totalDespesa).toFixed(2)}</td>`;
  balancoReceitaTbody.appendChild(trResultado);
}
