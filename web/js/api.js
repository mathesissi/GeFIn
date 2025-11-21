// web/js/api.js

// CORREÇÃO: Usa a origem atual (seja localhost ou ngrok)
// IMPORTANTE: Você deve acessar o site pela porta do servidor (3000)
const API_BASE_URL = window.location.origin;

// === HELPER: Cabeçalhos de Autenticação ===
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// === HELPER: Dados do Usuário Logado ===
function getUserData() {
    const json = localStorage.getItem('userData');
    if (!json) return null;
    return JSON.parse(json);
}

function getEmpresaId() {
    const user = getUserData();
    if (!user || !user.id_empresa) {
        console.error("Empresa não identificada no login.");
        return null; 
    }
    return user.id_empresa;
}

// === FUNÇÃO GENÉRICA DE FETCH ===
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();
    
    const config = {
        ...options,
        headers: { ...headers, ...options.headers }
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Evita loop se já estiver na tela de login
            if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && !window.location.pathname.includes('/web/')) {
                alert("Sessão expirada. Faça login novamente.");
                // Ajuste do caminho relativo dependendo de onde está
                window.location.href = '../index.html';
            }
            throw new Error("Sessão inválida.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP ${response.status}`);
        }

        if (response.status === 204) return null;

        return response.json();
    } catch (error) {
        if (error.message !== 'Sessão inválida.') {
            console.error(`Erro API (${endpoint}):`, error);
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(`Erro: ${error.message}`, 'error'); 
            }
        }
        throw error;
    }
}

// ==========================================================
// === CONTAS CONTÁBEIS ===
// ==========================================================
export async function getContas() {
    const idEmpresa = getEmpresaId();
    if (!idEmpresa) return [];
    return fetchAPI(`/contas/${idEmpresa}`);
}

export async function getContaById(id) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`);
}

export async function createConta(dadosConta) {
    const idEmpresa = getEmpresaId();
    const payload = { ...dadosConta, id_empresa: idEmpresa };
    return fetchAPI(`/contas`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateConta(id, dadosAtualizados) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`, { method: 'PUT', body: JSON.stringify(dadosAtualizados) });
}

export async function deleteConta(id) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`, { method: 'DELETE' });
}

// ==========================================================
// === LANÇAMENTOS ===
// ==========================================================
export const getLancamentos = () => fetchAPI('/lancamentos');
export const createLancamento = (lancamentoData) => fetchAPI('/lancamentos', { method: 'POST', body: JSON.stringify(lancamentoData) });

// ==========================================================
// === RELATÓRIOS & OUTROS ===
// ==========================================================
export const getBalancete = (mes, ano) => fetchAPI(`/balancete?mes=${mes}&ano=${ano}`);
export const getDRE = (mes, ano) => fetchAPI(`/dre?mes=${mes}&ano=${ano}`);
export const getEmpresaByCnpj = (cnpj) => fetchAPI(`/empresas/cnpj/${cnpj}`);
export const getEmpresaById = (id) => fetchAPI(`/empresas/${id}`);