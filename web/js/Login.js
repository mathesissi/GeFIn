// web/js/Login.js

const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.querySelector('.btn-primary');
const messageArea = document.getElementById('login-message-area');

// 1. CORREÇÃO: Apontar explicitamente para a porta 3000 (Backend)
const LOGIN_API_ENDPOINT = `${window.location.origin}/usuarios/login`;

// Função auxiliar para exibir mensagens
function showMessage(message, isError = true) {
    messageArea.textContent = message;
    messageArea.style.color = isError ? 'red' : 'green';
    
    if (typeof showSystemNotification === 'function') {
        showSystemNotification(message, isError ? 'error' : 'success');
    }
}

// Limpa a mensagem ao digitar
emailInput.addEventListener('input', () => messageArea.textContent = '');
passwordInput.addEventListener('input', () => messageArea.textContent = '');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = passwordInput.value;

    if (!email || !senha) {
        showMessage('Por favor, preencha o e-mail e a senha.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Acessando...';
    messageArea.textContent = ''; 

    const payload = { email, senha };

    try {
        const res = await fetch(LOGIN_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let data = {};
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else if (!res.ok) {
            const errorText = await res.text();
            // Tenta limpar mensagens de erro HTML padrão do Express
            const errorMatch = errorText.match(/Error:\s*([^<]+)/);
            if (errorMatch && errorMatch[1]) {
                 data = { message: errorMatch[1].trim() };
            } else {
                 data = { message: `Erro no Servidor (Status ${res.status})` };
            }
        }

        if (res.ok) {
            const token = data.token;
            const user = data.user;
            
            // Salva os dados necessários
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(user));
            
            showMessage('Login realizado! Redirecionando...', false);
            
            setTimeout(() => {
                // Redireciona para a pasta correta
                window.location.href = 'html/Home.html'; 
            }, 1000);

        } else {
            const errorMessage = data.message || 'Credenciais inválidas.';
            showMessage(errorMessage);
        }

    } catch (error) {
        console.error('Erro de rede:', error);
        showMessage('Não foi possível conectar ao servidor (Porta 3000).');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
    }
});