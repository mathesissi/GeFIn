import { getContas, createLancamento, getLancamentos } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referências aos Elementos ---
    const lancamentoForm = document.getElementById('lancamento-form');
    const addPartidaBtn = document.getElementById('add-partida');
    const partidasContainer = document.getElementById('partidas-container');
    const lancamentosTbody = document.getElementById('lancamentos-historico-tbody');
    const errorSummary = document.getElementById('form-error-summary');
    const errorList = document.getElementById('form-error-list');

    let contasCache = [];

    // --- Funções de Validação e UI ---

    const clearValidationErrors = () => {
        errorSummary.style.display = 'none';
        errorList.innerHTML = '';
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.validation-message').forEach(el => el.style.display = 'none');
    };

    const showError = (fieldId, message) => {
        const field = document.getElementById(fieldId);
        const errorField = document.getElementById(`${fieldId}-error`);
        if (field) field.classList.add('is-invalid');
        if (errorField) {
            errorField.textContent = message;
            errorField.style.display = 'block';
        }
    };
    
    const addSummaryError = (message) => {
        const li = document.createElement('li');
        li.textContent = message;
        errorList.appendChild(li);
        errorSummary.style.display = 'block';
    };

    const validateForm = () => {
        clearValidationErrors();
        let isValid = true;

        if (!document.getElementById('data').value) {
            showError('data', 'A data é obrigatória.');
            addSummaryError('O campo "Data" deve ser preenchido.');
            isValid = false;
        }
        if (!document.getElementById('descricao').value.trim()) {
            showError('descricao', 'A descrição é obrigatória.');
            addSummaryError('O campo "Descrição" não pode estar vazio.');
            isValid = false;
        }

        const partidas = partidasContainer.querySelectorAll('.partidas-grid');
        if (partidas.length < 2) {
            addSummaryError('É necessário ter pelo menos duas partidas (um débito e um crédito).');
            isValid = false;
        }

        let totalDebito = 0, totalCredito = 0;
        partidas.forEach((partida, index) => {
            const contaSelect = partida.querySelector('.conta-select');
            const valorInput = partida.querySelector('.valor-partida');
            
            if (!contaSelect.value) {
                contaSelect.classList.add('is-invalid');
                addSummaryError(`A Partida #${index + 1} precisa ter uma conta selecionada.`);
                isValid = false;
            }
            if (parseFloat(valorInput.value) <= 0 || !valorInput.value) {
                valorInput.classList.add('is-invalid');
                addSummaryError(`O valor da Partida #${index + 1} deve ser maior que zero.`);
                isValid = false;
            }
            
            const tipo = partida.querySelector('.tipo-partida').value;
            const valor = parseFloat(valorInput.value) || 0;
            if (tipo === 'debito') totalDebito += valor;
            else totalCredito += valor;
        });

        if (totalDebito !== totalCredito || totalDebito === 0) {
            addSummaryError('O total de débitos deve ser igual ao total de créditos e maior que zero.');
            isValid = false;
        }

        return isValid;
    };


    // --- Lógica Principal ---
    
    const loadContas = async () => {
        try {
            contasCache = await getContas();
            addPartida();
            addPartida();
        } catch (error) {
            console.error('Falha ao carregar contas para o formulário.');
        }
    };

    const createContaSelector = () => {
        const select = document.createElement('select');
        select.className = 'conta-select';
        select.innerHTML = '<option value="">Selecione uma conta</option>';
        contasCache.forEach(conta => {
            const option = document.createElement('option');
            option.value = conta.id_conta;
            option.textContent = `${conta.codigo_conta} - ${conta.nome_conta}`;
            select.appendChild(option);
        });
        return select;
    };

    const addPartida = () => {
        const newPartida = document.createElement('div');
        newPartida.classList.add('partidas-grid', 'form-group');
        const contaSelect = createContaSelector();
        
        newPartida.innerHTML = `
            <div class="conta-select-wrapper"></div>
            <select class="tipo-partida"><option value="debito">Débito</option><option value="credito">Crédito</option></select>
            <input type="number" class="valor-partida" placeholder="0,00" step="0.01">
            <button type="button" class="btn-icon btn-danger remove-partida" title="Remover Partida"><img src="../media/svg/delete.svg" alt="Remover"></button>
        `;
        newPartida.querySelector('.conta-select-wrapper').appendChild(contaSelect);
        partidasContainer.appendChild(newPartida);
    };

    const updateTotals = () => {
        let totalDebito = 0, totalCredito = 0;
        partidasContainer.querySelectorAll('.partidas-grid').forEach(partida => {
            const tipo = partida.querySelector('.tipo-partida').value;
            const valor = parseFloat(partida.querySelector('.valor-partida').value) || 0;
            if (tipo === 'debito') totalDebito += valor;
            else totalCredito += valor;
        });
        document.getElementById('total-debito').textContent = `R$ ${totalDebito.toFixed(2)}`;
        document.getElementById('total-credito').textContent = `R$ ${totalCredito.toFixed(2)}`;
        document.getElementById('diferenca').textContent = `R$ ${(totalDebito - totalCredito).toFixed(2)}`;
    };
    
    /** **CORRIGIDO** - Renderiza a tabela de lançamentos. A limpeza da tabela foi movida para cá. */
    const renderLancamentos = (lancamentos) => {
        lancamentosTbody.innerHTML = ''; // Limpa a tabela ANTES de adicionar as novas linhas.
        if (!lancamentos || lancamentos.length === 0) {
            lancamentosTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum lançamento encontrado.</td></tr>';
            return;
        }
        lancamentos.forEach(lanc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(lanc.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>${lanc.descricao}</td>
                <td>R$ ${parseFloat(lanc.valor).toFixed(2)}</td>
            `;
            lancamentosTbody.appendChild(tr);
        });
    };

    /** Busca e renderiza os lançamentos. */
    const loadAndRenderLancamentos = async () => {
        try {
            const lancamentos = await getLancamentos();
            renderLancamentos(lancamentos);
        } catch (error) {
            console.error('Falha ao carregar lançamentos.');
            lancamentosTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color: red;">Erro ao carregar histórico.</td></tr>';
        }
    };

    // --- Event Listeners ---
    addPartidaBtn.addEventListener('click', addPartida);
    partidasContainer.addEventListener('click', e => {
        if (e.target.closest('.remove-partida')) { e.target.closest('.partidas-grid').remove(); updateTotals(); }
    });
    partidasContainer.addEventListener('input', updateTotals);
    partidasContainer.addEventListener('change', updateTotals);

    lancamentoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        
        const partidas = Array.from(partidasContainer.querySelectorAll('.partidas-grid'));
        const debitos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'debito');
        const creditos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'credito');

        if (debitos.length !== 1 || creditos.length !== 1) {
            addSummaryError('Apenas lançamentos com um débito e um crédito são suportados.');
            errorSummary.style.display = 'block';
            return;
        }

        const lancamentoData = {
            data: document.getElementById('data').value,
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(debitos[0].querySelector('.valor-partida').value),
            id_conta_debito: parseInt(debitos[0].querySelector('.conta-select').value),
            id_conta_credito: parseInt(creditos[0].querySelector('.conta-select').value),
        };
        
        try {
            const novoLancamento = await createLancamento(lancamentoData); // A API retorna o lançamento criado
            // Limpa e reseta o formulário
            lancamentoForm.reset();
            partidasContainer.innerHTML = '';
            addPartida();
            addPartida();
            
            // **ATUALIZAÇÃO OTIMIZADA:** Adiciona a nova linha sem recarregar tudo
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(novoLancamento.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>${novoLancamento.descricao}</td>
                <td>R$ ${parseFloat(novoLancamento.valor).toFixed(2)}</td>
            `;
            lancamentosTbody.prepend(tr); // Adiciona no topo para feedback imediato

            alert('Lançamento salvo com sucesso!');
        } catch(error) {
           console.error("Falha ao criar lançamento:", error);
        }
    });

    // --- Carregamento Inicial ---
    await loadContas();
    await loadAndRenderLancamentos();
});