import { initUserProfile, checkAuthRedirect } from './UserProfile.js';
if (!checkAuthRedirect()) {
    throw new Error("Não autenticado");
}
// Define a URL base (ngrok ou localhost)
const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicia Perfil
    await initUserProfile(); 

    // 2. Define Data Atual (Mês e Ano)
    const hoje = new Date();
    // getMonth() retorna 0-11, então somamos +1
    const mesAtual = hoje.getMonth() + 1; 
    const anoAtual = hoje.getFullYear();

    // 3. Carrega o Dashboard com a data correta
    await carregarBalancete(mesAtual, anoAtual);

    // 4. Configura botão de relatório
    const btnRelatorio = document.getElementById('gerar-relatorio');
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', gerarMiniRelatorio);
    }
});

// ==========================================
// LÓGICA DO DASHBOARD
// ==========================================

async function carregarBalancete(mes, ano) {
    try {
        const token = localStorage.getItem('authToken');
        
        // Se não tiver token, nem tenta buscar (evita erro 401 desnecessário aqui)
        if (!token) return;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Validação extra para garantir que não envie "undefined"
        if (!mes || !ano) {
            throw new Error("Mês e Ano são obrigatórios para buscar o balancete.");
        }

        const response = await fetch(`${API_BASE_URL}/balancete?mes=${mes}&ano=${ano}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Ajuste para estrutura da resposta (pode vir array direto ou objeto { contas: [] })
        const listaContas = data.contas || data; 

        if (!listaContas || !Array.isArray(listaContas)) {
            // Se vier vazio ou formato inesperado, tratamos como sem dados mas sem erro crítico
            if (typeof showSystemNotification === 'function') {
                showSystemNotification('Nenhum dado financeiro encontrado para este mês.', 'info');
            }
            return;
        }

        // Filtros das categorias
        const categorias = {
            saldoCaixa: [],
            contasPagar: [],
            contasReceber: [],
            resultadoMes: []
        };

        listaContas.forEach(c => {
            const codigo = c.codigo_conta;
            if (codigo.startsWith('1.1')) categorias.saldoCaixa.push(c);
            else if (codigo.startsWith('2.1')) categorias.contasPagar.push(c);
            else if (codigo.startsWith('1.2')) categorias.contasReceber.push(c);
            else if (codigo.startsWith('3') || codigo.startsWith('4')) categorias.resultadoMes.push(c);
        });

        popularLista('saldo-caixa', categorias.saldoCaixa);
        popularLista('contas-pagar', categorias.contasPagar);
        popularLista('contas-receber', categorias.contasReceber);
        popularLista('resultado-mes', categorias.resultadoMes);

    } catch (error) {
        console.error('Erro ao carregar balancete:', error);
        
        // CORREÇÃO: Usando o sistema de notificação (Toast)
        if (typeof showSystemNotification === 'function') {
            showSystemNotification(`Erro ao carregar dashboard: ${error.message}`, 'error');
        }

        // Feedback visual nos cards (opcional, para não deixar vazio)
        const containers = ['saldo-caixa', 'contas-pagar', 'contas-receber', 'resultado-mes'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<li style="color:#777; font-size:0.9em; font-style:italic">Não foi possível carregar</li>';
        });
    }
}

function popularLista(elementId, contas) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';

    if (contas.length === 0) {
        container.innerHTML = '<li style="color: #888; font-style: italic;">Sem dados</li>';
        return;
    }

    contas.forEach(conta => {
        const li = document.createElement('li');
        
        // Calcula saldo (Débito - Crédito) ou usa saldo_final se disponível
        const debito = Number(conta.total_debito || conta.movimento_debito || 0);
        const credito = Number(conta.total_credito || conta.movimento_credito || 0);
        const saldoFinal = Number(conta.saldo_final) || (debito - credito);

        // Formatação de moeda
        const valorFormatado = Math.abs(saldoFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const corValor = saldoFinal < 0 ? 'color: #dc3545;' : 'color: #28a745;'; // Vermelho ou Verde

        li.innerHTML = `
            <label style="display:flex; align-items:center; width:100%; cursor:pointer; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                    <input type="checkbox" 
                        data-nome="${conta.nome_conta}" 
                        data-debito="${debito}" 
                        data-credito="${credito}">
                    <span style="margin-left: 8px;">${conta.nome_conta}</span>
                </div>
                <span style="font-weight:bold; ${corValor}">${valorFormatado}</span>
            </label>
        `;
        container.appendChild(li);
    });
}

function gerarMiniRelatorio() {
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');
    const containerRelatorio = document.getElementById('mini-relatorio');

    if (checked.length === 0) {
        if (typeof showSystemNotification === 'function') {
            showSystemNotification('Selecione pelo menos uma conta para gerar o relatório.', 'warning');
        } else {
            containerRelatorio.innerHTML = '<p>Nenhuma conta selecionada.</p>';
        }
        return;
    }

    let totalDebito = 0;
    let totalCredito = 0;
    let itensHtml = '';

    checked.forEach(input => {
        const nome = input.dataset.nome;
        const debito = parseFloat(input.dataset.debito);
        const credito = parseFloat(input.dataset.credito);

        totalDebito += debito;
        totalCredito += credito;
        
        itensHtml += `<li><strong>${nome}</strong> - D: ${debito.toLocaleString('pt-BR', {minimumFractionDigits: 2})} | C: ${credito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>`;
    });

    const saldo = totalDebito - totalCredito; 
    const corSaldo = saldo >= 0 ? 'green' : 'red';

    containerRelatorio.innerHTML = `
        <h3>Mini Relatório Personalizado</h3>
        <ul style="margin: 10px 0; padding-left: 20px; list-style: circle;">${itensHtml}</ul>
        <div style="margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p><strong>Total Débito:</strong> R$ ${totalDebito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <p><strong>Total Crédito:</strong> R$ ${totalCredito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <p style="color: ${corSaldo}; font-size: 1.1em;"><strong>Saldo Resultante:</strong> R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
    `;
    
    if (typeof showSystemNotification === 'function') {
        showSystemNotification('Relatório gerado com sucesso!', 'success');
    }
}