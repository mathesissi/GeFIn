import { getEmpresaByCnpj } from './api.js';

// ===============================
// ELEMENTOS DO FORMULÁRIO
// ===============================
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmInput = document.getElementById('confirmSenha');
const cnpjInput = document.getElementById('cnpj');
const submitBtn = document.getElementById('btnSubmit');
const form = document.getElementById('signupForm');

// MENSAGENS
const nomeMsg = document.getElementById('nomeMsg');
const emailMsg = document.getElementById('emailMsg');
const senhaMsg = document.getElementById('senhaMsg');
const confirmMsg = document.getElementById('confirmMsg');
const cnpjMsg = document.getElementById('cnpjMsg');


// ===============================
// UTILITÁRIOS DE CNPJ
// ===============================
function onlyDigits(value) {
    return value.replace(/\D/g, '');
}

function formatCNPJ(value) {
    const v = onlyDigits(value);
    if (v.length <= 2) return v;
    if (v.length <= 5) return v.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (v.length <= 8) return v.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (v.length <= 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
}

// A função isValidCNPJ (validação matemática) foi removida.
// A validação de existência é feita no backend via API.


// ===============================
// FUNÇÕES DE ESTILO
// ===============================
function setValid(el, msgEl, message) {
    el.classList.remove('invalid');
    el.classList.add('valid');
    msgEl.textContent = message || '';
    msgEl.classList.remove('error');
    msgEl.classList.add('success');
}

function setInvalid(el, msgEl, message) {
    el.classList.remove('valid');
    el.classList.add('invalid');
    msgEl.textContent = message || '';
    msgEl.classList.remove('success');
    msgEl.classList.add('error');
}

function clearState(el, msgEl) {
    el.classList.remove('valid', 'invalid');
    msgEl.textContent = '';
    msgEl.classList.remove('success', 'error');
}


// ===============================
// VALIDAÇÕES
// ===============================
function validateName() {
    if (!nomeInput.value.trim()) {
        setInvalid(nomeInput, nomeMsg, "Nome é obrigatório");
        return false;
    }
    setValid(nomeInput, nomeMsg);
    return true;
}

function validateEmail() {
    const v = emailInput.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!v) {
        setInvalid(emailInput, emailMsg, "E-mail é obrigatório");
        return false;
    }
    if (!re.test(v)) {
        setInvalid(emailInput, emailMsg, "E-mail inválido");
        return false;
    }

    setValid(emailInput, emailMsg, "E-mail válido");
    return true;
}

function validatePassword() {
    const v = senhaInput.value;
    if (v.length < 6) {
        setInvalid(senhaInput, senhaMsg, "Mínimo de 6 caracteres");
        return false;
    }
    clearState(senhaInput, senhaMsg);
    return true;
}

function validatePasswordMatch() {
    if (!senhaInput.value || !confirmInput.value) {
        clearState(confirmInput, confirmMsg);
        return false;
    }

    if (senhaInput.value !== confirmInput.value) {
        setInvalid(confirmInput, confirmMsg, "Senhas não coincidem");
        return false;
    }

    setValid(confirmInput, confirmMsg, "Senhas conferem");
    return true;
}

function validateCNPJ() {
    const v = cnpjInput.value.trim();
    const digits = onlyDigits(v);

    // Validação simplificada: apenas checa se possui 14 dígitos (presença e formato)
    if (digits.length !== 14) {
        setInvalid(cnpjInput, cnpjMsg, "CNPJ deve conter 14 dígitos.");
        return false;
    }

    setValid(cnpjInput, cnpjMsg, "CNPJ pronto para verificação.");
    return true;
}

function allValid() {
    return (
        validateName() &&
        validateEmail() &&
        validatePassword() &&
        validatePasswordMatch() &&
        validateCNPJ()
    );
}

function updateSubmitState() {
    submitBtn.disabled = !allValid();
}


// ===============================
// EVENTOS
// ===============================
nomeInput.addEventListener("input", () => {
    validateName();
    updateSubmitState();
});

emailInput.addEventListener("input", () => {
    validateEmail();
    updateSubmitState();
});

senhaInput.addEventListener("input", () => {
    validatePassword();
    validatePasswordMatch();
    updateSubmitState();
});

confirmInput.addEventListener("input", () => {
    validatePasswordMatch();
    updateSubmitState();
});

cnpjInput.addEventListener("input", e => {
    e.target.value = formatCNPJ(e.target.value);
    validateCNPJ();
    updateSubmitState();
});


// ===============================
// SUBMIT (ENVIO AO BACKEND) - LÓGICA FINAL
// ===============================
const SIGNUP_API_ENDPOINT = `${window.location.origin}/usuarios/signup`;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!allValid()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Criando conta...";
    nomeMsg.textContent = "";

    const cnpjDigits = onlyDigits(cnpjInput.value); 
    let idEmpresa = null;
    
    // --- PASSO 1: Buscar ID da Empresa pelo CNPJ ---
    try {
        const empresa = await getEmpresaByCnpj(cnpjDigits);
        idEmpresa = empresa.id_empresa;
    } catch (error) {
        // Erro 404 (Empresa não encontrada) ou falha de rede/servidor
        const errorMessage = "Falha no Cadastro: Empresa não encontrada para o CNPJ fornecido. O cadastro requer que a empresa já esteja registrada. Verifique o CNPJ ou a existência da empresa.";
        
        if (typeof showSystemNotification === 'function') {
            showSystemNotification(errorMessage, 'error');
        }
        
        nomeMsg.textContent = ""; 
        nomeMsg.classList.remove("success", "error"); 
        submitBtn.disabled = false;
        submitBtn.textContent = "Criar Conta";
        return; 
    }
    
    // --- PASSO 2: Criar Usuário com ID da Empresa ---
    const payload = {
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        senha: senhaInput.value,
        id_empresa: idEmpresa // Envia o ID da empresa encontrado
    };

    try {
        // Envia o payload, assumindo que o Controller/Service aceita 'id_empresa'
        const res = await fetch(SIGNUP_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        let data = {};
        const contentType = res.headers.get("content-type");

        // 1. Tenta ler o corpo como JSON
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else if (!res.ok) {
            // 2. Se for um erro e não for JSON (possivelmente HTML), tenta extrair a mensagem
            const errorText = await res.text();
            
            const errorMatch = errorText.match(/Error:\s*([^<]+)/);
            if (errorMatch && errorMatch[1]) {
                 data = { message: errorMatch[1].trim() };
            } else {
                 data = { message: `Erro desconhecido (Status ${res.status})` };
            }
        }

        if (res.ok) {
            const successMessage = "Conta criada com sucesso! Redirecionando...";
            
            // Notificação de sucesso
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(successMessage, 'success');
            }

            nomeMsg.textContent = successMessage;
            nomeMsg.classList.remove("error");
            nomeMsg.classList.add("success");

            setTimeout(() => {
                window.location.href = "../index.html"; 
            }, 2000);

        } else {
            let errorMessage = data.message || "Erro ao criar conta. Tente novamente.";
            
            errorMessage = "Falha no Cadastro: " + errorMessage;

            // Notificação de erro
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(errorMessage, 'error');
            }

            // Limpa o erro inline e reabilita o botão
            nomeMsg.textContent = ""; 
            nomeMsg.classList.remove("success", "error"); 
            submitBtn.disabled = false;
            submitBtn.textContent = "Criar Conta";
        }

    } catch (err) {
        const errorMessage = "Falha na conexão com o servidor. Verifique se o backend está rodando.";
        
        // Notificação de erro de rede
        if (typeof showSystemNotification === 'function') {
            showSystemNotification(errorMessage, 'error');
        }

        // Limpa o erro inline e reabilita o botão
        nomeMsg.textContent = ""; 
        nomeMsg.classList.remove("success", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Criar Conta";
    }
});


// ===============================
// ESTADO INICIAL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    clearState(nomeInput, nomeMsg);
    clearState(emailInput, emailMsg);
    clearState(senhaInput, senhaMsg);
    clearState(confirmInput, confirmMsg);
    clearState(cnpjInput, cnpjMsg);
    updateSubmitState();
});