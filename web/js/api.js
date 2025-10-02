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
            // [1] Tentar obter o tipo de conteúdo da resposta
            const contentType = response.headers.get("content-type");
            let errorMessage = 'Ocorreu um erro desconhecido na API.';
            
            // [2] Verificar se a resposta é JSON antes de tentar o .json()
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    // Assumimos que o JSON de erro tem um campo 'message'
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Ocorreu um erro ao parsear JSON, usar a mensagem padrão
                    console.warn("Erro ao parsear JSON de erro:", e);
                }
            } else {
                // Se não for JSON (provavelmente HTML), tentamos ler como texto para debug
                const errorText = await response.text();
                // Usamos a mensagem padrão ou podemos tentar extrair algo do texto
                // Mas, crucialmente, NÃO tentamos .json()
                console.error("Resposta de erro não é JSON (Possível HTML):", errorText);
            }
            
            // Lança a exceção com a mensagem correta (JSON ou padrão)
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {};
        }

        return response.json();
    } catch (error) {
        // Agora, este bloco só é executado para a exceção que acabamos de lançar
        // ou para erros de rede (que não retornam response)
        console.error(`Erro na chamada da API para ${endpoint}:`, error);
        // O alert agora mostrará a mensagem que você formatou (JSON ou padrão)
        alert(`Erro: ${error.message}`); 
        throw error;
    }
}

// --- Funções da API de Contas ---

export const getContas = () => fetchAPI('/contas');

export const getContaById = (id) => fetchAPI(`/contas/${id}`); 

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