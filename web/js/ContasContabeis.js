import { getContas, createConta, deleteConta, updateConta, getContaById } from './api.js'; // 1. Importar getContaById e updateConta

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
    const modalTitle = document.getElementById('modal-title');
    
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'id_conta';
    accountForm.appendChild(idInput);

    const subtiposMap = {
        Ativo: ['Ativo Circulante', 'Realizável a Longo Prazo', 'Investimento', 'Imobilizado', 'Intangível'],
        Passivo: ['Passivo Circulante', 'Passivo Não Circulante']
    };

    const openModal = (conta = null) => { // [MODIFICADO] Para aceitar dados da conta
        accountForm.reset();
        subtipoGroup.style.display = 'none';
        idInput.value = '';

        if (conta) {
            modalTitle.textContent = 'Editar Conta';
            idInput.value = conta.id_conta; // Preenche o ID para o submit saber que é edição
            document.getElementById('codigo').value = conta.codigo_conta;
            document.getElementById('nome').value = conta.nome_conta;
            tipoSelect.value = conta.tipo_conta;
            
            updateSubtipoOptions();
            if (conta.subtipo_conta) {
                subtipoSelect.value = conta.subtipo_conta;
            }
        } else {
            modalTitle.textContent = 'Adicionar Nova Conta';
        }
        
        modal.style.display = 'flex';
    };
    
    const closeModal = () => {
        modal.style.display = 'none';
        accountForm.reset();
        subtipoGroup.style.display = 'none';
        idInput.value = '';
        modalTitle.textContent = 'Adicionar Nova Conta'; // Restaura o título
    };

    const updateSubtipoOptions = () => {
        const selectedTipo = tipoSelect.value;
        const subtipos = subtiposMap[selectedTipo];

        subtipoSelect.innerHTML = '';
        if (subtipos && subtipos.length > 0) {
            subtipos.forEach(subtipo => {
                const option = document.createElement('option');
                option.value = subtipo;
                option.textContent = subtipo;
                subtipoSelect.appendChild(option);
            });
            subtipoGroup.style.display = 'block';
        } else {
            subtipoGroup.style.display = 'none';
        }
    };

    const renderTable = (contas) => {
        accountsTbody.innerHTML = ''; 
        contas.forEach(conta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conta.codigo_conta}</td>
                <td>${conta.nome_conta}</td>
                <td>${conta.tipo_conta}</td>
                <td>${conta.subtipo_conta || '-'}</td>
                <td class="action-cell">
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
        }
    };
    

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => openModal(null)); 
    cancelBtn.addEventListener('click', closeModal);
    tipoSelect.addEventListener('change', updateSubtipoOptions);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const id = idInput.value; 
        const isEditing = !!id; 

        const formData = {
            codigo_conta: document.getElementById('codigo').value,
            nome_conta: document.getElementById('nome').value,
            tipo_conta: tipoSelect.value,
            subtipo_conta: subtipoGroup.style.display === 'block' ? subtipoSelect.value : undefined,
        };

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