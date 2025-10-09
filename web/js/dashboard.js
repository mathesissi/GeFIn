// dashboard.js
const API_BASE_URL = window.location.origin;
async function carregarBalancete(mes, ano) {
    try {
       const response = await fetch(`${API_BASE_URL}/balancete?mes=${mes}&ano=${ano}`);

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        if (!data || !data.contas) {
            console.error('Balancete não retornou contas', data);
            return;
        }

        const categorias = {
            saldoCaixa: [],
            contasPagar: [],
            contasReceber: [],
            resultadoMes: []
        };

        data.contas.forEach(c => {
            const codigo = c.codigo_conta;
            if (codigo.startsWith('1')) categorias.saldoCaixa.push(c);
            else if (codigo.startsWith('2')) categorias.contasPagar.push(c);
            else if (codigo.startsWith('3')) categorias.contasReceber.push(c);
            else categorias.resultadoMes.push(c);
        });

        popularLista('saldo-caixa', categorias.saldoCaixa);
        popularLista('contas-pagar', categorias.contasPagar);
        popularLista('contas-receber', categorias.contasReceber);
        popularLista('resultado-mes', categorias.resultadoMes);

    } catch (error) {
        console.error('Erro ao carregar balancete:', error);
        alert('Não foi possível carregar o balancete. Verifique o backend.');
    }
}

function popularLista(elementId, contas) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (contas.length === 0) {
        container.innerHTML = '<li>Nenhuma conta disponível</li>';
        return;
    }

    contas.forEach(conta => {
        const li = document.createElement('li');
        li.innerHTML = `
            <label>
                <input type="checkbox" data-debito="${conta.total_debito}" data-credito="${conta.total_credito}">
                ${conta.nome_conta} - Débito: R$ ${conta.total_debito.toFixed(2)} / Crédito: R$ ${conta.total_credito.toFixed(2)}
            </label>
        `;
        container.appendChild(li);
    });
}

function gerarMiniRelatorio() {
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');

    if (checked.length === 0) {
        document.getElementById('mini-relatorio').innerHTML = '<p>Nenhuma conta selecionada.</p>';
        return;
    }

    let totalDebito = 0;
    let totalCredito = 0;
    const relatorioContas = [];

    checked.forEach(input => {
        const label = input.parentNode.textContent.trim();
        const debito = parseFloat(input.dataset.debito);
        const credito = parseFloat(input.dataset.credito);

        totalDebito += debito;
        totalCredito += credito;
        relatorioContas.push(label);
    });

    const saldo = totalCredito - totalDebito;

    document.getElementById('mini-relatorio').innerHTML = `
        <h3>Mini Relatório</h3>
        <ul>${relatorioContas.map(c => `<li>${c}</li>`).join('')}</ul>
        <p><strong>Total Débito:</strong> R$ ${totalDebito.toFixed(2)}</p>
        <p><strong>Total Crédito:</strong> R$ ${totalCredito.toFixed(2)}</p>
        <p><strong>Saldo:</strong> R$ ${saldo.toFixed(2)}</p>
    `;
}

document.getElementById('gerar-relatorio').addEventListener('click', gerarMiniRelatorio);

// Inicializa com mês/ano atuais
const hoje = new Date();
carregarBalancete(hoje.getMonth() + 1, hoje.getFullYear());
