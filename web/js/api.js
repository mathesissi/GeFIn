// web/js/api.js

// 1. CORREÇÃO: Apontar explicitamente para a porta do Backend (3000) para evitar erros de porta cruzada
const API_BASE_URL = 'http://localhost:3000';

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

// Recupera o ID da empresa salvo no login para usar nas rotas
function getEmpresaId() {
    const user = getUserData();
    // Se não tiver usuário ou ID, retorna null (o backend vai bloquear, mas evitamos crash no front)
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

        // Tratamento de Sessão Expirada (401)
        if (response.status === 401) {
            if (window.location.pathname.indexOf('index.html') === -1) {
                alert("Sessão expirada ou inválida. Faça login novamente.");
                window.location.href = '../index.html';
            }
            throw new Error("Sessão inválida.");
        }

        if (!response.ok) {
            // Tenta ler o erro como JSON, se falhar lê como texto
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP ${response.status}`);
        }

        // Retorna vazio se for 204 No Content (ex: delete)
        if (response.status === 204) return null;

        return response.json();
    } catch (error) {
        // Não exibe erro se for redirecionamento de sessão
        if (error.message !== 'Sessão inválida.') {
            console.error(`Erro na chamada API (${endpoint}):`, error);
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(`Erro: ${error.message}`, 'error'); 
            } else {
                alert(`Erro: ${error.message}`);
            }
        }
        throw error;
    }
}

// ==========================================================
// === CONTAS CONTÁBEIS (Ajustado para o teu Controller) ===
// ==========================================================

// GET /contas/{id_empresa}
export async function getContas() {
    const idEmpresa = getEmpresaId();
    if (!idEmpresa) return [];
    return fetchAPI(`/contas/${idEmpresa}`);
}

// GET /contas/{id_empresa}/{id}
export async function getContaById(id) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`);
}

// POST /contas (Injeta id_empresa no corpo)
export async function createConta(dadosConta) {
    const idEmpresa = getEmpresaId();
    const payload = { ...dadosConta, id_empresa: idEmpresa };
    
    return fetchAPI(`/contas`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

// PUT /contas/{id_empresa}/{id}
export async function updateConta(id, dadosAtualizados) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dadosAtualizados)
    });
}

// DELETE /contas/{id_empresa}/{id}
export async function deleteConta(id) {
    const idEmpresa = getEmpresaId();
    return fetchAPI(`/contas/${idEmpresa}/${id}`, {
        method: 'DELETE'
    });
}

// ==========================================================
// === LANÇAMENTOS (Controller corrigido usa token JWT) ===
// ==========================================================

export const getLancamentos = () => fetchAPI('/lancamentos');
export const createLancamento = (lancamentoData) => fetchAPI('/lancamentos', { method: 'POST', body: JSON.stringify(lancamentoData) });

// ==========================================================
// === RELATÓRIOS & OUTROS ===
// ==========================================================

export const getBalancete = (mes, ano) => fetchAPI(`/balancete?mes=${mes}&ano=${ano}`);
export const getEmpresaByCnpj = (cnpj) => fetchAPI(`/empresas/cnpj/${cnpj}`);
export const getDRE = (mes, ano) => fetchAPI(`/dre?mes=${mes}&ano=${ano}`);