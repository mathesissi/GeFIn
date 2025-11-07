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

const livroDiarioView = document.getElementById('livrodiario-view');
const livroDiarioTbody = document.getElementById('livrodiario-tbody');

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
// BALANCETE
// =====================
function mostrarBalancete(balancete, mes, ano) {
  reportTitle.textContent = `Balancete de Verificação - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'block';
  balancoView.style.display = 'none';
  livroDiarioView.style.display = 'none';

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
// BALANÇO PATRIMONIAL
// =====================
function mostrarBalanco(balanco, mes, ano) {
  reportTitle.textContent = `Balanço Patrimonial - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'none';
  balancoView.style.display = 'block';
  livroDiarioView.style.display = 'none';

  balancoAtivoTbody.innerHTML = '';
  balancoPassivoTbody.innerHTML = '';
  balancoPlTbody.innerHTML = '';
  balancoAtivoTfoot.innerHTML = '';
  balancoPassivoTfoot.innerHTML = '';
  balancoPlTfoot.innerHTML = '';

  const renderSecao = (tbody, contas) => {
    contas.forEach(conta => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${conta.nome_conta}</td>
        <td style="text-align:right;">Saldo Inicial: ${conta.saldo_inicial.toFixed(2)} | Saldo Final: ${conta.saldo_final.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  };

  renderSecao(balancoAtivoTbody, balanco.Ativo || []);
  renderSecao(balancoPassivoTbody, balanco.Passivo || []);
  renderSecao(balancoPlTbody, balanco.PatrimonioLiquido || []);
}

// =====================
// LIVRO DIÁRIO
// =====================
function mostrarLivroDiario(lancamentos, mes, ano) {
  reportTitle.textContent = `Livro Diário - ${mes}/${ano}`;
  reportViewContainer.style.display = 'block';
  balanceteView.style.display = 'none';
  balancoView.style.display = 'none';
  livroDiarioView.style.display = 'block';

  livroDiarioTbody.innerHTML = '';

  if (!lancamentos || lancamentos.length === 0) {
    livroDiarioTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum lançamento encontrado.</td></tr>`;
    return;
  }

  lancamentos.forEach(l => {
    const tr = document.createElement('tr');
    tr.classList.add('livro-row');
    tr.innerHTML = `
      <td>${new Date(l.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
      <td>${l.descricao}</td>
      <td colspan="2" style="text-align:center;">R$ ${parseFloat(l.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td style="text-align:center;">
        <button class="btn btn-secondary btn-expand" data-id="${l.id_transacao}" style="padding: 2px 10px;">+</button>
      </td>
    `;
    livroDiarioTbody.appendChild(tr);
  });

  // Eventos de expansão
  livroDiarioTbody.querySelectorAll('.btn-expand').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const currentRow = e.target.closest('tr');

      // Se já estiver expandido, recolhe
      const next = currentRow.nextElementSibling;
      if (next && next.classList.contains('detail-row')) {
        next.remove();
        e.target.textContent = '+';
        return;
      }

      e.target.textContent = '...'; // indicador de loading
      try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/livrodiario/${id}/detalhes`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const detalhes = await response.json();

        const detailRow = document.createElement('tr');
        detailRow.classList.add('detail-row');
        const col = document.createElement('td');
        col.colSpan = 5;

        let inner = `
          <table class="data-table" style="margin-top: 0.5rem;">
            <thead>
              <tr>
                <th>Conta</th>
                <th>Tipo Partida</th>
                <th>Tipo Conta</th>
                <th>Subtipo</th>
                <th>Subtipo Secundário</th>
                <th style="text-align:right;">Valor</th>
              </tr>
            </thead>
            <tbody>
        `;

        detalhes.forEach(d => {
          inner += `
            <tr>
              <td>${d.conta}</td>
              <td>${d.tipo_partida}</td>
              <td>${d.tipo_conta || '-'}</td>
              <td>${d.subtipo_conta || '-'}</td>
              <td>${d.subtipo_secundario || '-'}</td>
              <td style="text-align:right;">${parseFloat(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          `;
        });

        inner += '</tbody></table>';
        col.innerHTML = inner;
        detailRow.appendChild(col);
        currentRow.insertAdjacentElement('afterend', detailRow);
        e.target.textContent = '-';
      } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showSystemNotification('Erro ao carregar detalhes do lançamento.');
        e.target.textContent = '+';
      }
    });
  });
}
