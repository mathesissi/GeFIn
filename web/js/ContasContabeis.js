import { getContas, createConta, deleteConta, updateConta, getContaById } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos elementos do DOM ---
    const addBtn = document.getElementById('add-account-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const modal = document.getElementById('add-account-modal');
    const accountForm = document.getElementById('account-form');
    const accountsTbody = document.getElementById('accounts-tbody');
    const tipoSelect = document.getElementById('tipo');
    
    const subtipoGroup = document.getElementById('subtipo-group');
    const subtipoSelect = document.getElementById('subtipo');
    
    const subtipoSecundarioGroup = document.getElementById('subtipo-secundario-group');
    const subtipoSecundarioSelect = document.getElementById('subtipo_secundario');
    
    const modalTitle = document.getElementById('modal-title');
    
    // Garante que o campo oculto ID exista
    let idInput = document.getElementById('id_conta');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'id_conta';
        accountForm.appendChild(idInput);
    }

    // Mapeamento de Subtipos e Exibição
    const subtiposMap = {
        Ativo: {
            options: ['Ativo Circulante', 'Ativo Nao Circulante'], 
            secondary: {
                'Ativo Nao Circulante': ['Realizavel a Longo Prazo', 'Investimento', 'Imobilizado', 'Intangivel']
            }
        },
        Passivo: {
            options: ['Passivo Circulante', 'Passivo Nao Circulante'],
            secondary: {} 
        },
        'PatrimonioLiquido': { options: [] },
        Receita: { options: [] },
        Despesa: { options: [] }
    };
    
    const displayMap = {
        'PatrimonioLiquido': 'Patrimônio Líquido',
        'Ativo Nao Circulante': 'Ativo Não Circulante',
        'Passivo Nao Circulante': 'Passivo Não Circulante',
        'Realizavel a Longo Prazo': 'Realizável a Longo Prazo',
        'Intangivel': 'Intangível'
    };

    const getDisplayText = (value) => displayMap[value] || value;

    // --- Funções Auxiliares ---

    const populateSelectAndSet = (selectElement, options, selectedValue) => {
        selectElement.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = options.length > 0 ? "Selecione..." : "N/A";
        selectElement.appendChild(defaultOption);

        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = getDisplayText(optionText);
            selectElement.appendChild(option);
        });
        if (selectedValue) selectElement.value = selectedValue;
    };

    const updateSubtipoOptions = () => {
        const selectedTipo = tipoSelect.value;
        const currentSubtipos = subtiposMap[selectedTipo];

        subtipoSelect.innerHTML = '';
        subtipoSecundarioGroup.style.display = 'none';
        subtipoSecundarioSelect.innerHTML = '';

        if (currentSubtipos && currentSubtipos.options && currentSubtipos.options.length > 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Selecione um subtipo principal";
            subtipoSelect.appendChild(defaultOption);

            currentSubtipos.options.forEach(subtipo => {
                const option = document.createElement('option');
                option.value = subtipo;
                option.textContent = getDisplayText(subtipo);
                subtipoSelect.appendChild(option);
            });
            subtipoGroup.style.display = 'block';
        } else {
            subtipoGroup.style.display = 'none';
        }
        updateSubtipoSecundarioOptions();
    };
    
    const updateSubtipoSecundarioOptions = () => {
        const selectedTipo = tipoSelect.value;
        const selectedSubtipo = subtipoSelect.value;
        const secondaryMap = subtiposMap[selectedTipo]?.secondary;

        subtipoSecundarioSelect.innerHTML = '';
        subtipoSecundarioGroup.style.display = 'none';

        if (secondaryMap && secondaryMap[selectedSubtipo] && secondaryMap[selectedSubtipo].length > 0) {
            const secondaryOptions = secondaryMap[selectedSubtipo];
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Selecione um subtipo secundário";
            subtipoSecundarioSelect.appendChild(defaultOption);

            secondaryOptions.forEach(subtipo => {
                const option = document.createElement('option');
                option.value = subtipo;
                option.textContent = getDisplayText(subtipo);
                subtipoSecundarioSelect.appendChild(option); 
            });
            subtipoSecundarioGroup.style.display = 'block';
        }
    };

    // --- Gestão do Modal ---

    const openModal = (conta = null) => {
        accountForm.reset();
        subtipoGroup.style.display = 'none';
        subtipoSecundarioGroup.style.display = 'none';
        idInput.value = '';

        if (conta) {
            modalTitle.textContent = 'Editar Conta';
            idInput.value = conta.id_conta;
            document.getElementById('codigo').value = conta.codigo_conta;
            document.getElementById('nome').value = conta.nome_conta;
            tipoSelect.value = conta.tipo_conta;
            
            // Popula os selects cascata
            const currentSubtipos = subtiposMap[conta.tipo_conta];
            if (currentSubtipos && currentSubtipos.options.length > 0) {
                populateSelectAndSet(subtipoSelect, currentSubtipos.options, conta.subtipo_conta);
                subtipoGroup.style.display = 'block';

                if (currentSubtipos.secondary && currentSubtipos.secondary[conta.subtipo_conta]) {
                    populateSelectAndSet(subtipoSecundarioSelect, currentSubtipos.secondary[conta.subtipo_conta], conta.subtipo_secundario);
                    subtipoSecundarioGroup.style.display = 'block';
                }
            }
        } else {
            modalTitle.textContent = 'Adicionar Nova Conta';
            updateSubtipoOptions(); // Reseta os selects para o estado inicial
        }
        modal.style.display = 'flex';
    };
    
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // --- Renderização da Tabela ---

    const renderTable = (contas) => {
        accountsTbody.innerHTML = ''; 
        if(!contas || contas.length === 0) {
             accountsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma conta cadastrada.</td></tr>';
             return;
        }

        contas.forEach(conta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conta.codigo_conta}</td>
                <td>${conta.nome_conta}</td>
                <td>${getDisplayText(conta.tipo_conta)}</td> 
                <td>${getDisplayText(conta.subtipo_conta) || '-'}</td>
                <td>${getDisplayText(conta.subtipo_secundario) || '-'}</td> 
                <td class="action-cell">
                    <button class="btn-icon btn-edit" data-id="${conta.id_conta}" title="Editar">
                        <img src="../media/svg/edit.svg" alt="Editar" style="width:16px;height:16px;">
                    </button>
                    <button class="btn-icon btn-delete" data-id="${conta.id_conta}" title="Excluir">
                        <img src="../media/svg/delete.svg" alt="Excluir" style="width:16px;height:16px;">
                    </button>
                </td>
            `;
            accountsTbody.appendChild(tr);
        });
    };

    const loadAndRenderAccounts = async () => {
        try {
            // Chama API que já injeta o token e ID da empresa
            const contas = await getContas(); 
            renderTable(contas || []);
        } catch (error) {
            console.error("Falha ao carregar contas:", error);
        }
    };

    // --- Event Listeners ---

    addBtn.addEventListener('click', () => openModal(null)); 
    cancelBtn.addEventListener('click', closeModal);
    
    // Listeners para Selects em Cascata
    tipoSelect.addEventListener('change', updateSubtipoOptions);
    subtipoSelect.addEventListener('change', updateSubtipoSecundarioOptions); 

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // SUBMIT DO FORMULÁRIO
    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const id = idInput.value; 
        const isEditing = !!id; 

        // Função auxiliar para pegar valor ou undefined (importante para o backend não receber string vazia)
        const getVal = (el) => el && el.offsetParent !== null && el.value ? el.value : undefined;
        
        const formData = {
            codigo_conta: document.getElementById('codigo').value,
            nome_conta: document.getElementById('nome').value,
            tipo_conta: tipoSelect.value, 
            subtipo_conta: getVal(subtipoSelect),
            subtipo_secundario: getVal(subtipoSecundarioSelect),
        };

        try {
            if (isEditing) {
                await updateConta(id, formData);
                if(typeof showSystemNotification === 'function') showSystemNotification('Conta atualizada!');
            } else {
                await createConta(formData);
                if(typeof showSystemNotification === 'function') showSystemNotification('Conta criada!');
            }
            closeModal();
            loadAndRenderAccounts(); 
        } catch (error) {
            // Erros já são logados pelo api.js, mas podemos forçar um alerta aqui se necessário
            console.error(error);
        }
    });

    // AÇÕES DA TABELA (Delegated Events)
    accountsTbody.addEventListener('click', async (event) => {
        // Garante que pegamos o botão mesmo clicando no ícone SVG
        const deleteButton = event.target.closest('.btn-delete');
        const editButton = event.target.closest('.btn-edit');
        
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                try {
                    await deleteConta(id);
                    loadAndRenderAccounts();
                    if(typeof showSystemNotification === 'function') showSystemNotification('Conta excluída!');
                } catch (e) {
                    // Erro tratado no api.js
                }
            }
        }
        
        if (editButton) {
            const id = editButton.dataset.id;
            try {
                const conta = await getContaById(id);
                if(conta) openModal(conta);
            } catch (e) {
                console.error(e);
            }
        }
    });

    // Inicialização
    loadAndRenderAccounts();
});