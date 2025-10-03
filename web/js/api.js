const API_BASE_URL = window.location.origin; // URL base da sua API back-end

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = `Erro no Servidor (Status ${response.status}). Verifique o console do back-end.`;
            
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || 'Ocorreu um erro desconhecido na API.';
                } catch (e) {
                    console.warn("Erro ao analisar JSON de erro:", e);
                }
            } else {
                const errorText = await response.text();
                console.error("Resposta de erro não-JSON (possivelmente HTML):", errorText);
            }
            
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {};
        }

        return response.json();
    } catch (error) {
        console.error(`Erro na chamada da API para ${endpoint}:`, error);
        alert(`Erro: ${error.message}`); 
        throw error;
    }
}

// --- Funções da API de Contas ---
export const getContas = () => fetchAPI('/contas');
export const getContaById = (id) => fetchAPI(`/contas/${id}`); 
export const createConta = (contaData) => fetchAPI('/contas', { method: 'POST', body: JSON.stringify(contaData) });
export const updateConta = (id, contaData) => fetchAPI(`/contas/${id}`, { method: 'PUT', body: JSON.stringify(contaData) });
export const deleteConta = (id) => fetchAPI(`/contas/${id}`, { method: 'DELETE' });

// --- Funções da API de Lançamentos ---
export const getLancamentos = () => fetchAPI('/lancamentos');
export const createLancamento = (lancamentoData) => fetchAPI('/lancamentos', { method: 'POST', body: JSON.stringify(lancamentoData) });

// --- Funções da API de Relatórios ---
export const getBalancete = (mes, ano) => fetchAPI(`/balancete?mes=${mes}&ano=${ano}`);
export const getBalancoPatrimonial = (mes, ano) => fetchAPI(`/balanco-patrimonial?mes=${mes}&ano=${ano}`);
