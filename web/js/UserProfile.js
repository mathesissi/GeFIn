import { getEmpresaById } from './api.js';
export function checkAuthRedirect() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}
// HTML do Modal (Template String)
const modalTemplate = `
<div id="profile-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Perfil do Usuário</h2>
            <span class="close-btn" id="close-profile-btn">&times;</span>
        </div>
        <div class="modal-body profile-info">
            <p><strong>Nome:</strong> <span id="profile-nome">Carregando...</span></p>
            <p><strong>Email:</strong> <span id="profile-email">-</span></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <p><strong>Empresa:</strong> <span id="profile-empresa">Carregando...</span></p>
            <p><strong>CNPJ:</strong> <span id="profile-cnpj">-</span></p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-close-modal-action">Fechar</button>
        </div>
    </div>
</div>
`;

export async function initUserProfile() {
    // 1. Injeta o Modal no final do body se não existir
    if (!document.getElementById('profile-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalTemplate);
    }

    // 2. Configura os dados do usuário e empresa
    const userData = await loadUserData();

    // 3. Configura os eventos (Abrir/Fechar modal e Logout)
    setupEvents(userData);
}

async function loadUserData() {
    try {
        const json = localStorage.getItem('userData');
        if (!json) return null;
        
        const user = JSON.parse(json);
        const token = localStorage.getItem('authToken');

        // Preenche dados básicos (Header e Modal)
        updateText('header-username', user.nome);
        updateText('profile-nome', user.nome);
        updateText('profile-email', user.email);

        // Busca dados da empresa (Se tiver ID)
        if (user.id_empresa) {
            try {
                // Usa a função do api.js para buscar empresa
                const empresa = await getEmpresaById(user.id_empresa);
                if (empresa) {
                    updateText('profile-empresa', empresa.razao_social);
                    updateText('profile-cnpj', empresa.cnpj);
                }
            } catch (err) {
                console.error("Erro ao buscar empresa", err);
                updateText('profile-empresa', "Erro ao carregar");
            }
        }
        return user;
    } catch (e) {
        console.error("Erro no perfil:", e);
    }
}

function updateText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text || '-';
}

function setupEvents(user) {
    const modal = document.getElementById('profile-modal');
    
    // Botões que abrem o perfil (pode ser o nome ou ícone no header)
    const btnOpen = document.getElementById('btn-open-profile'); 
    
    // Botões de Fechar
    const btnCloseX = document.getElementById('close-profile-btn');
    const btnCloseAction = document.getElementById('btn-close-modal-action');
    
    // Botão Sair
    const btnLogout = document.getElementById('btn-logout');

    // Evento Abrir
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // Eventos Fechar
    const fechar = () => modal.style.display = 'none';
    if (btnCloseX) btnCloseX.addEventListener('click', fechar);
    if (btnCloseAction) btnCloseAction.addEventListener('click', fechar);
    
    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) fechar();
    });

    // Evento Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm(`Sair do sistema, ${user ? user.nome : ''}?`)) {
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                window.location.href = '/web/index.html';
            }
        });
    }
}   