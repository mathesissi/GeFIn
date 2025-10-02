import { getContas, createConta, deleteConta } from './api.js';

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

    // --- Mapeamento de Tipos para Subtipos ---
    const subtiposMap = {
        Ativo: ['Ativo Circulante', 'Realizável a Longo Prazo', 'Investimento', 'Imobilizado', 'Intangível'],
        Passivo: ['Passivo Circulante', 'Passivo Não Circulante'],
        PatrimonioLiquido: ['Patrimônio Líquido']
    };

    // --- Funções ---
    const openModal = () => modal.style.display = 'flex';
    const closeModal = () => {
        modal.style.display = 'none';
        accountForm.reset();
        subtipoGroup.style.display = 'none';
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
        accountsTbody.innerHTML = ''; // Limpa a tabela
        contas.forEach(conta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conta.codigo_conta}</td>
                <td>${conta.nome_conta}</td>
                <td>${conta.tipo_conta}</td>
                <td>${conta.subtipo_conta || 'N/A'}</td>
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

    // --- Event Listeners ---
    addBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    tipoSelect.addEventListener('change', updateSubtipoOptions);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            codigo_conta: document.getElementById('codigo').value,
            nome_conta: document.getElementById('nome').value,
            tipo_conta: tipoSelect.value,
            subtipo_conta: subtipoGroup.style.display === 'block' ? subtipoSelect.value : undefined,
        };

        try {
            await createConta(formData);
            closeModal();
            loadAndRenderAccounts(); // Recarrega e renderiza a tabela
            alert('Conta criada com sucesso!');
        } catch (error) {
            // A mensagem de erro já é mostrada pelo fetchAPI
        }
    });

    accountsTbody.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                try {
                    await deleteConta(id);
                    loadAndRenderAccounts();
                    alert('Conta excluída com sucesso!');
                } catch (error) {
                    // A mensagem de erro já é mostrada pelo fetchAPI
                }
            }
        }
        // TODO: Adicionar lógica para o botão de editar
    });

    // --- Carregamento Inicial ---
    loadAndRenderAccounts();
});