// src/web/empresa-cadastro.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('empresaForm');
    const cnpjInput = document.getElementById('cnpj');
    const messageElement = document.getElementById('message');
    const btnSubmit = document.querySelector('.btn-signup');

    // --- Utilitário de Formatação de CNPJ ---
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

    // --- Validação Básica de Frontend ---
    function isValid() {
        const razaoSocial = document.getElementById('razao_social').value.trim();
        const cnpjDigits = onlyDigits(cnpjInput.value);
        let valid = true;
        let errorMessage = '';

        // 1. Validação da Razão Social
        if (razaoSocial.length < 5) {
            errorMessage += 'Razão Social deve ter no mínimo 5 caracteres.';
            valid = false;
        }

        // 2. Validação do CNPJ (Agora obrigatório e deve ter 14 dígitos)
        if (cnpjDigits.length === 0) {
            errorMessage += (errorMessage ? ' ' : '') + 'CNPJ é obrigatório.';
            valid = false;
        } else if (cnpjDigits.length !== 14) { 
            errorMessage += (errorMessage ? ' ' : '') + 'CNPJ deve conter exatamente 14 dígitos.';
            valid = false;
        }

        if (!valid) {
            messageElement.textContent = 'Erro de Validação: ' + errorMessage;
            messageElement.style.color = 'red';
            return false;
        }
        
        messageElement.textContent = '';
        return true;
    }

    // --- Máscara de CNPJ no Input ---
    cnpjInput.addEventListener('input', (e) => {
        const el = e.target;
        el.value = formatCNPJ(el.value);
    });

    // --- Submissão do Formulário ---
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!isValid()) {
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Aguarde...';
        messageElement.textContent = '';
        
        const razao_social = document.getElementById('razao_social').value.trim();
        const cnpj = onlyDigits(cnpjInput.value); // Envia APENAS dígitos
const data = {
            razao_social: razao_social,
            cnpj: cnpj // Envia o CNPJ (agora obrigatório)
        };
        
        try {
            const response = await fetch('http://localhost:3000/empresas', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            let result = {};
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else if (!response.ok) {
                 const errorText = await response.text();
                 
                 // CORREÇÃO: Extrai a mensagem de erro que está dentro do HTML (após 'Error: ' e antes de '<')
                 const errorMatch = errorText.match(/Error:\s*([^<]+)/);
                 if (errorMatch && errorMatch[1]) {
                     result = { message: errorMatch[1].trim() };
                 } else {
                     // Fallback para o texto completo ou erro genérico
                     result = { message: errorText.trim() || `Erro desconhecido (Status ${response.status})` };
                 }
            }


            if (response.ok) {
                // SUCESSO E REDIRECIONAMENTO
                const successMessage = `Empresa criada com sucesso! ID: ${result.id_empresa}. Redirecionando...`;
                
                if (typeof showSystemNotification === 'function') {
                    showSystemNotification(successMessage, 'success');
                }
                
                messageElement.textContent = successMessage;
                messageElement.style.color = 'green';
                
                setTimeout(() => {
                    window.location.href = '../index.html'; 
                }, 1500); 
            } else {
                // AGORA TRATA ERROS DE VALIDAÇÃO (como empresa já existente)
                let errorMessage = result.message || `Erro do Servidor (Status ${response.status}).`;
                
                // Prefixamos a mensagem para dar um destaque maior ao erro de validação
                if (errorMessage.includes("Já existe uma empresa cadastrada com o CNPJ") || response.status === 400) {
                   errorMessage = "Falha no Cadastro: " + errorMessage;
                }
                
                if (typeof showSystemNotification === 'function') {
                    showSystemNotification(errorMessage, 'error');
                }
                
                messageElement.textContent = errorMessage;
                messageElement.style.color = 'red';
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Finalizar';
            }

        } catch (error) {
            // Este bloco agora só é executado em caso de falha de rede real (ex: servidor offline)
            console.error('Erro de rede ou servidor:', error);
            const errorMessage = 'Falha na conexão com o servidor. Verifique se o backend está rodando.';
            
            if (typeof showSystemNotification === 'function') {
                showSystemNotification(errorMessage, 'error');
            }
            
            messageElement.textContent = errorMessage;
            messageElement.style.color = 'red';
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Finalizar';
        }
    });
});