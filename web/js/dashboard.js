// dashboard.js

// 1. CORREÇÃO: Apontar para a porta do Backend (3000)
const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Gerenciar Usuário (LocalStorage)
    verificarLoginEAtualizarDados();
    setupProfileModal();

    // 2. Carregar Dados do Dashboard
    // Ajuste a data conforme necessário
    carregarBalancete(10, 2025);

    // Event listener do botão de relatório
    const btnRelatorio = document.getElementById('gerar-relatorio');
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', gerarMiniRelatorio);
    }
});

// ==========================================
// LÓGICA DE USUÁRIO (LOCALSTORAGE)
// ==========================================

// ==========================================
// LÓGICA DE USUÁRIO (LOCALSTORAGE + FETCH EMPRESA)
// ==========================================

async function verificarLoginEAtualizarDados() {
    try {
        let usuarioJson = localStorage.getItem('userData');
        const token = localStorage.getItem('authToken');

        // Fallback para usuário de teste se não houver login
        if (!usuarioJson) {
            console.warn("Nenhum usuário logado encontrado.");
            const usuarioPadrao = {
                id_empresa: 1, // ID fictício para teste
                nome: "Usuário Teste",
                email: "teste@exemplo.com"
            };
            // Não salvamos no localStorage para não sobrescrever login real futuro, 
            // apenas usamos em memória ou mostramos aviso.
            // Mas se quiser manter o comportamento anterior:
            usuarioJson = JSON.stringify(usuarioPadrao);
        }

        const usuario = JSON.parse(usuarioJson);
        
        // 1. Atualiza dados básicos (Nome e Email) que já temos
        const headerName = document.getElementById('header-username');
        if (headerName) headerName.textContent = usuario.nome;

        const elNome = document.getElementById('profile-nome');
        const elEmail = document.getElementById('profile-email');
        if (elNome) elNome.textContent = usuario.nome;
        if (elEmail) elEmail.textContent = usuario.email;

        // 2. Busca dados da Empresa se tivermos o ID
        if (usuario.id_empresa) {
            try {
                // Faz a requisição para pegar Razão Social e CNPJ
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${API_BASE_URL}/empresas/${usuario.id_empresa}`, {
                    method: 'GET',
                    headers: headers
                });

                if (res.ok) {
                    const empresaInfo = await res.json();
                    
                    // Atualiza a interface com os dados vindos do banco
                    const elEmpresa = document.getElementById('profile-empresa');
                    const elCnpj = document.getElementById('profile-cnpj');
                    
                    if (elEmpresa) elEmpresa.textContent = empresaInfo.razao_social || "Nome indisponível";
                    if (elCnpj) elCnpj.textContent = empresaInfo.cnpj || "CNPJ indisponível";
                } else {
                    console.error("Erro ao buscar empresa:", res.status);
                }
            } catch (erroEmpresa) {
                console.error("Falha de conexão ao buscar empresa:", erroEmpresa);
            }
        } else {
            // Se não tiver id_empresa no login
            document.getElementById('profile-empresa').textContent = "Empresa não vinculada";
        }

    } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
    }
}

function setupProfileModal() {
    const modal = document.getElementById('profile-modal');
    const btnOpen = document.getElementById('btn-open-profile');
    const btnClose = document.getElementById('close-profile-btn');
    const btnCloseAction = document.getElementById('btn-close-modal-action');
    const btnLogout = document.getElementById('btn-logout');

    if (!modal) return;

    // Abrir modal
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // Fechar modal
    const fecharModal = () => { modal.style.display = 'none'; };
    if (btnClose) btnClose.addEventListener('click', fecharModal);
    if (btnCloseAction) btnCloseAction.addEventListener('click', fecharModal);
    
    // Fechar clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja sair?")) {
                // Remove as credenciais corretas
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                alert("Você saiu do sistema.");
                window.location.href = '../index.html'; // Redireciona para o login
            }
        });
    }
}

// ==========================================
// LÓGICA DO DASHBOARD
// ==========================================

async function carregarBalancete(mes, ano) {
    try {
        // 3. CORREÇÃO: Usar API_BASE_URL para chamar a porta 3000
        // Além disso, precisamos passar o token de autenticação se sua API exigir
        const token = localStorage.getItem('authToken');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; // Adiciona token se existir
        }

        const response = await fetch(`${API_BASE_URL}/balancete?mes=${mes}&ano=${ano}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        
        // Ajuste para estrutura provável da resposta
        // Se sua API retorna { contas: [...] }, mantenha. Se retorna array direto, ajuste.
        const listaContas = data.contas || data; 

        if (!listaContas || !Array.isArray(listaContas)) {
            console.error('Formato de resposta inesperado:', data);
            return;
        }

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
        // Feedback visual opcional
        const containers = ['saldo-caixa', 'contas-pagar', 'contas-receber', 'resultado-mes'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<li style="color:red; font-size:0.8em">Erro de conexão com API</li>';
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
        
        // Tratamento seguro para saldo_final (caso venha nulo ou string)
        const saldoFinal = Number(conta.saldo_final) || 0;

        li.innerHTML = `
            <label style="display:flex; align-items:center; width:100%; cursor:pointer;">
                <input type="checkbox" 
                       data-nome="${conta.nome_conta}" 
                       data-debito="${saldoFinal > 0 ? saldoFinal : 0}" 
                       data-credito="${saldoFinal < 0 ? Math.abs(saldoFinal) : 0}">
                <span style="flex:1; margin-left: 8px;">${conta.nome_conta}</span>
                <span style="font-weight:bold;">R$ ${Math.abs(saldoFinal).toFixed(2)}</span>
            </label>
        `;
        container.appendChild(li);
    });
}

function gerarMiniRelatorio() {
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');
    const containerRelatorio = document.getElementById('mini-relatorio');

    if (checked.length === 0) {
        containerRelatorio.innerHTML = '<p>Nenhuma conta selecionada.</p>';
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
        
        itensHtml += `<li>${nome} - D: ${debito.toFixed(2)} | C: ${credito.toFixed(2)}</li>`;
    });

    const saldo = totalDebito - totalCredito; 

    containerRelatorio.innerHTML = `
        <h3>Mini Relatório Personalizado</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">${itensHtml}</ul>
        <div style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
            <p><strong>Total Débito:</strong> R$ ${totalDebito.toFixed(2)}</p>
            <p><strong>Total Crédito:</strong> R$ ${totalCredito.toFixed(2)}</p>
            <p style="color: ${saldo >= 0 ? 'green' : 'red'}"><strong>Saldo Resultante:</strong> R$ ${saldo.toFixed(2)}</p>
        </div>
    `;
}