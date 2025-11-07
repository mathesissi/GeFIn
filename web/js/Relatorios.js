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

// Novo container para o Livro Diário
let livroDiarioView = document.createElement('div');
livroDiarioView.id = 'livrodiario-view';
livroDiarioView.style.display = 'none';
livroDiarioView.innerHTML = `
  <div class="table-container">
      <table class="data-table">
          <thead>
              <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Conta Débito</th>
                  <th>Conta Crédito</th>
                  <th style="text-align:right;">Valor</th>
              </tr>
          </thead>
          <tbody id="livrodiario-tbody"></tbody>
      </table>
  </div>
`;
reportViewContainer.appendChild(livroDiarioView);

let selectedReport = null;

// =====================
// Seleção do relatório
// =====================
reportCards.forEach(card => {
  card.addEventListener('click', () => {
    selectedReport = card.dataset.report;
    reportCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    if (['balancete', 'balanco', 'livrodiario'].includes(selectedReport)) {
      filterContainer.style.display = 'block';
      reportViewContainer.style.display = 'none';
    } else {
      filterContainer.style.display = 'none';
      reportViewContainer.style.display = 'none';
    }
  });
});

// =====================
// Submissão do filtro
// =====================
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
      mostrarBalanco(data.balanco || {}, mes, ano);
    }

    if (selectedReport === 'livrodiario') {
      const response = await fetch(`${baseUrl}/livrodiario?mes=${mes}&ano=${ano}`);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      mostrarLivroDiario(data, mes, ano);
    }

  } catch (error) {
    showSystemNotification(`Erro ao gerar relatório: ${error.message}`);
    console.error(error);
  }
});

// =====================
// Função para mostrar o Livro Diário
// =====================
function mostrarLivroDiario(livro, mes, ano) {
  reportTitle.textContent = `Livro Diário - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'none';
  balancoView.style.display = 'none';
  livroDiarioView.style.display = 'block';

  const tbody = document.getElementById('livrodiario-tbody');
  tbody.innerHTML = '';

  if (!livro || livro.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum lançamento encontrado.</td></tr>`;
    return;
  }

  livro.forEach(lancamento => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lancamento.data}</td>
      <td>${lancamento.descricao}</td>
      <td>${lancamento.conta_debito}</td>
      <td>${lancamento.conta_credito}</td>
      <td style="text-align:right;">${Number(lancamento.valor || 0).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}
