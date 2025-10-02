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
    
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'id_conta';
    accountForm.appendChild(idInput);

    // Estrutura atualizada para suportar hierarquia de subtipos com valores padronizados (sem acentos, com espaços canónicos)
    const subtiposMap = {
        Ativo: {
            // Subtipos Principais
            options: ['Ativo Circulante', 'Ativo Nao Circulante'], 
            // Subtipos Secundários aninhados sob 'Ativo Nao Circulante'
            secondary: {
                'Ativo Nao Circulante': [
                    'Realizavel a Longo Prazo', 
                    'Investimento',
                    'Imobilizado',
                    'Intangivel'
                ]
            }
        },
        Passivo: {
            options: ['Passivo Circulante', 'Passivo Nao Circulante'],
            secondary: {} 
        },
        'Patrimonio Liquido': { options: [] }, // VALOR PADRONIZADO
        Receita: { options: [] },
        Despesa: { options: [] }
    };
    
    // Mapeamento para exibir os nomes bonitos (com acentos) no dropdown e na tabela
    const displayMap = {
        'Patrimonio Liquido': 'Patrimônio Líquido',
        'Ativo Nao Circulante': 'Ativo Não Circulante',
        'Passivo Nao Circulante': 'Passivo Não Circulante',
        'Realizavel a Longo Prazo': 'Realizável a Longo Prazo',
        'Intangivel': 'Intangível',
        // Valores que são iguais ao display para facilitar a função
        'Ativo': 'Ativo',
        'Passivo': 'Passivo',
        'Receita': 'Receita',
        'Despesa': 'Despesa',
        'Ativo Circulante': 'Ativo Circulante',
        'Passivo Circulante': 'Passivo Circulante',
        'Investimento': 'Investimento',
        'Imobilizado': 'Imobilizado'
    };

    const getDisplayText = (value) => displayMap[value] || value;


    const openModal = (conta = null) => {
        accountForm.reset();
        subtipoGroup.style.display = 'none';
        subtipoSecundarioGroup.style.display = 'none'; // Esconder o novo campo
        idInput.value = '';

        // Helper para preencher e selecionar um valor de um campo Select
        const populateSelectAndSet = (selectElement, options, selectedValue) => {
            selectElement.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = options.length > 0 ? "Selecione..." : "N/A";
            selectElement.appendChild(defaultOption);

            options.forEach(optionText => {
                const option = document.createElement('option');
                option.value = optionText;
                option.textContent = getDisplayText(optionText); // Usando displayMap para o texto
                selectElement.appendChild(option);
            });
            if (selectedValue) {
                selectElement.value = selectedValue;
            }
        };

        if (conta) {
            modalTitle.textContent = 'Editar Conta';
            idInput.value = conta.id_conta;
            document.getElementById('codigo').value = conta.codigo_conta;
            document.getElementById('nome').value = conta.nome_conta;
            tipoSelect.value = conta.tipo_conta;
            
            const currentSubtipos = subtiposMap[conta.tipo_conta];

            if (currentSubtipos && currentSubtipos.options.length > 0) {
                // 1. Popular e selecionar o Subtipo Principal
                populateSelectAndSet(subtipoSelect, currentSubtipos.options, conta.subtipo_conta);
                subtipoGroup.style.display = 'block';

                if (currentSubtipos.secondary && currentSubtipos.secondary[conta.subtipo_conta]) {
                    const secondaryOptions = currentSubtipos.secondary[conta.subtipo_conta];
                    // 2. Popular e selecionar o Subtipo Secundário
                    populateSelectAndSet(subtipoSecundarioSelect, secondaryOptions, conta.subtipo_secundario);
                    subtipoSecundarioGroup.style.display = 'block';
                }
            }
        } else {
            modalTitle.textContent = 'Adicionar Nova Conta';
        }
        
        // Em modo de adição, sempre chamamos para popular o primeiro dropdown
        if (!conta) {
             updateSubtipoOptions();
        }
        
        modal.style.display = 'flex';
    };
    
    const closeModal = () => {
        modal.style.display = 'none';
        accountForm.reset();
        subtipoGroup.style.display = 'none';
        subtipoSecundarioGroup.style.display = 'none';
        idInput.value = '';
        modalTitle.textContent = 'Adicionar Nova Conta';
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
                option.textContent = getDisplayText(subtipo); // Usando displayMap
                subtipoSelect.appendChild(option);
            });
            subtipoGroup.style.display = 'block';
        } else {
            subtipoGroup.style.display = 'none';
        }
        // Quando o tipo muda, o subtipo secundário deve ser atualizado ou escondido
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
                option.textContent = getDisplayText(subtipo); // Usando displayMap
                subtipoSecundarioSelect.appendChild(option); 
            });
            subtipoSecundarioGroup.style.display = 'block';
        }
    };

    const renderTable = (contas) => {
        accountsTbody.innerHTML = ''; 
        contas.forEach(conta => {
            const tr = document.createElement('tr');
            // Usando getDisplayText para exibir o nome bonito na tabela
            const tipoValue = conta.tipo_conta;
            const subtipoValue = conta.subtipo_conta;
            const subtipoSecundarioValue = conta.subtipo_secundario;

            const tipoDisplay = getDisplayText(tipoValue) || tipoValue;
            const subtipoDisplay = getDisplayText(subtipoValue) || subtipoValue || '-';
            const subtipoSecundarioDisplay = getDisplayText(subtipoSecundarioValue) || subtipoSecundarioValue || '-';
            
            tr.innerHTML = `
                <td>${conta.codigo_conta}</td>
                <td>${conta.nome_conta}</td>
                <td>${tipoDisplay}</td> 
                <td>${subtipoDisplay}</td>
                <td>${subtipoSecundarioDisplay}</td> <td class="action-cell">
                    <button class="btn-icon btn-edit" data-id="${conta.id_conta}" title="Editar"><img src="../media/svg/edit.svg" alt="Editar"></button>
                    <button class="btn-icon btn-delete" data-id="${conta.id_conta}" title="Excluir"><img src="../media/svg/delete.svg" alt="Excluir"></button>
                </td>
            `;
            accountsTbody.appendChild(tr);
        });
    };

    const loadAndRenderAccounts = async () => {
        try {
            const contas = await getContas();
            renderTable(contas);
        } catch (error) {
            console.error("Falha ao carregar contas.");
        }
    };

    const handleEditClick = async (id) => {
        try {
            const conta = await getContaById(id);
            if (conta) {
                openModal(conta); 
            } else {
                alert('Erro: Conta não encontrada.');
            }
        } catch (error) {
            console.error("Falha ao buscar conta para edição.", error);
        }
    };
    

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => openModal(null)); 
    cancelBtn.addEventListener('click', closeModal);
    tipoSelect.addEventListener('change', updateSubtipoOptions);
    // Novo listener para atualizar o subtipo secundário quando o principal muda
    subtipoSelect.addEventListener('change', updateSubtipoSecundarioOptions); 

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const id = idInput.value; 
        const isEditing = !!id; 

        // Capturando valor do Subtipo Secundário
        const isSubtipoPrincipalVisible = subtipoGroup.style.display === 'block';
        const isSecondaryVisible = subtipoSecundarioGroup.style.display === 'block';

        // Lógica para enviar undefined se o campo estiver invisível ou vazio (a validação de obrigatoriedade é no backend)
        const getFieldValue = (element, isVisible) => {
            // Trim() para remover espaços acidentais antes de verificar se é uma string vazia
            const value = element.value ? element.value.trim() : undefined;
            return isVisible && value !== "" ? value : undefined;
        };
        
        const formData = {
            codigo_conta: document.getElementById('codigo').value,
            nome_conta: document.getElementById('nome').value,
            tipo_conta: tipoSelect.value, 
            subtipo_conta: getFieldValue(subtipoSelect, isSubtipoPrincipalVisible),
            subtipo_secundario: getFieldValue(subtipoSecundarioSelect, isSecondaryVisible),
        };

        // Adicionando validação front-end básica para o campo Tipo, que é obrigatório
        if (formData.tipo_conta === "") {
             alert('Erro: O campo Tipo (Conta) é obrigatório.');
             return;
        }
        
        try {
            if (isEditing) {
                await updateConta(id, formData);
                alert('Conta atualizada com sucesso!');
            } else {
                await createConta(formData);
                alert('Conta criada com sucesso!');
            }
            
            closeModal();
            loadAndRenderAccounts(); 
        } catch (error) {
            const errorMessage = error.message || "Erro desconhecido ao salvar conta.";
            alert(`Erro ao salvar conta: ${errorMessage}`);
            console.error(error);
        }
    });

    accountsTbody.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        const editButton = event.target.closest('.btn-edit');
        
        if (deleteButton) {
            const id = Number(deleteButton.dataset.id);
            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                try {
                    await deleteConta(id);
                    loadAndRenderAccounts();
                    alert('Conta excluída com sucesso!');
                } catch (error) {
                    alert('Erro ao excluir conta.');
                    console.error("Falha ao excluir conta.", error);
                }
            }
        }
        
        if (editButton) {
            const id = Number(editButton.dataset.id);
            await handleEditClick(id);
        }
    });

    loadAndRenderAccounts();
});