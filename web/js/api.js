const API_BASE_URL = 'http://localhost:3000'; // URL base da sua API back-end

/**
 * Função genérica para realizar chamadas à API.
 * @param {string} endpoint - O endpoint a ser chamado (ex: '/contas').
 * @param {object} options - Opções para a chamada fetch (método, headers, body, etc.).
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocorreu um erro na API');
        }
        
        // Retorna um objeto vazio para respostas sem conteúdo (ex: DELETE 204 No Content)
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

export const createConta = (contaData) => fetchAPI('/contas', {
    method: 'POST',
    body: JSON.stringify(contaData),
});

export const updateConta = (id, contaData) => fetchAPI(`/contas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contaData),
});

export const deleteConta = (id) => fetchAPI(`/contas/${id}`, {
    method: 'DELETE',
});


// --- Funções da API de Lançamentos ---

export const getLancamentos = () => fetchAPI('/lancamentos');

export const createLancamento = (lancamentoData) => fetchAPI('/lancamentos', {
    method: 'POST',
    body: JSON.stringify(lancamentoData),
});


// --- Funções da API de Relatórios ---

export const getBalancete = (mes, ano) => fetchAPI(`/balancetes?mes=${mes}&ano=${ano}`);