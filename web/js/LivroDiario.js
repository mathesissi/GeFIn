import { getContas, createLancamento } from './api.js'; 
// Removido getLancamentos da importação pois não é mais usado aqui

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referências aos Elementos ---
    const lancamentoForm = document.getElementById('lancamento-form');
    const addPartidaBtn = document.getElementById('add-partida');
    const partidasContainer = document.getElementById('partidas-container');
    
    // REMOVIDO: referência à tabela que não existe mais
    // const lancamentosTbody = document.getElementById('lancamentos-historico-tbody');
    
    const errorSummary = document.getElementById('form-error-summary');
    const errorList = document.getElementById('form-error-list');
    const totalDebitoSpan = document.getElementById('total-debito');
    const totalCreditoSpan = document.getElementById('total-credito');
    const diferencaSpan = document.getElementById('diferenca');

    let contasCache = [];

    // --- Funções de Validação e UI ---

    const clearValidationErrors = () => {
        if(errorSummary) errorSummary.style.display = 'none';
        if(errorList) errorList.innerHTML = '';
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
        
        const dataInput = document.getElementById('data');
        const descricaoInput = document.getElementById('descricao');

        if (!dataInput.value) {
            showError('data', 'A data é obrigatória.');
            isValid = false;
        }
        if (!descricaoInput.value.trim()) {
            showError('descricao', 'A descrição é obrigatória.');
            isValid = false;
        }

        const partidas = Array.from(partidasContainer.querySelectorAll('.partidas-grid'));

        if (partidas.length < 2) {
            addSummaryError('É necessário ter pelo menos duas partidas (débito e crédito).');
            isValid = false;
        }

        let totalDebito = 0;
        let totalCredito = 0;
        let temDebito = false;
        let temCredito = false;
        
        partidas.forEach((partida, index) => {
            const contaSelect = partida.querySelector('.conta-select');
            const tipoSelect = partida.querySelector('.tipo-partida');
            const valorInput = partida.querySelector('.valor-partida');
            
            contaSelect.classList.remove('is-invalid');
            valorInput.classList.remove('is-invalid');

            let partidaIsValid = true;

            if (!contaSelect.value) {
                contaSelect.classList.add('is-invalid');
                partidaIsValid = false;
            }
            
            const valor = parseFloat(valorInput.value) || 0;
            if (valor <= 0 || !valorInput.value) {
                valorInput.classList.add('is-invalid');
                partidaIsValid = false;
            }

            if (partidaIsValid) {
                const tipo = tipoSelect.value;
                if (tipo === 'debito') {
                    totalDebito += valor;
                    temDebito = true;
                } else if (tipo === 'credito') {
                    totalCredito += valor;
                    temCredito = true;
                }
            } else {
                isValid = false; 
            }
        });

        if (Math.abs(totalDebito - totalCredito) > 0.005 || totalDebito === 0) {
            addSummaryError(`O total de débitos (R$ ${totalDebito.toFixed(2)}) deve ser igual ao total de créditos (R$ ${totalCredito.toFixed(2)}).`);
            isValid = false;
        }
        
        if (!temDebito || !temCredito) {
            addSummaryError('A transação deve conter pelo menos um débito e pelo menos um crédito.');
            isValid = false;
        }

        return isValid;
    };

    // --- Lógica Principal ---
    
    const loadContas = async () => {
        try {
            const response = await getContas();
            contasCache = Array.isArray(response) ? response : [];
            
            if (partidasContainer.innerHTML === '') {
                addPartida();
                addPartida();
            }
        } catch (error) {
            console.error('Falha ao carregar contas:', error);
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
        
        const contaSelectWrapper = document.createElement('div');
        contaSelectWrapper.className = 'conta-select-wrapper';
        contaSelectWrapper.appendChild(createContaSelector());

        const tipoSelect = document.createElement('select');
        tipoSelect.className = 'tipo-partida';
        tipoSelect.innerHTML = '<option value="debito">Débito</option><option value="credito">Crédito</option>';

        const valorInput = document.createElement('input');
        valorInput.type = 'number';
        valorInput.className = 'valor-partida';
        valorInput.placeholder = '0,00';
        valorInput.step = '0.01';
        valorInput.min = '0.01';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn-icon btn-danger remove-partida';
        removeButton.title = 'Remover Partida';
        removeButton.innerHTML = '<img src="../media/svg/delete.svg" alt="X" style="width:16px;">';
        
        newPartida.appendChild(contaSelectWrapper);
        newPartida.appendChild(tipoSelect);
        newPartida.appendChild(valorInput);
        newPartida.appendChild(removeButton);

        partidasContainer.appendChild(newPartida);
        updateTotals();
    };

    const updateTotals = () => {
        let totalDebito = 0;
        let totalCredito = 0;

        partidasContainer.querySelectorAll('.partidas-grid').forEach(partida => {
            const tipo = partida.querySelector('.tipo-partida').value;
            const valor = parseFloat(partida.querySelector('.valor-partida').value) || 0;
            
            if (tipo === 'debito') {
                totalDebito += valor;
            } else if (tipo === 'credito') {
                totalCredito += valor;
            }
        });
        
        totalDebitoSpan.textContent = `R$ ${totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        totalCreditoSpan.textContent = `R$ ${totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
        const diferenca = totalDebito - totalCredito;
        diferencaSpan.textContent = `R$ ${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        diferencaSpan.style.color = Math.abs(diferenca) < 0.005 ? 'green' : 'red';
    };
    
    // --- Funções de renderização REMOVIDAS ---
    // renderLancamentos() -> Removido
    // loadAndRenderLancamentos() -> Removido

    // --- Event Listeners ---
    addPartidaBtn.addEventListener('click', addPartida);
    
    partidasContainer.addEventListener('click', e => {
        if (e.target.closest('.remove-partida')) { 
            if (partidasContainer.querySelectorAll('.partidas-grid').length > 2) {
                e.target.closest('.partidas-grid').remove(); 
                updateTotals(); 
            } else {
                alert("Um lançamento deve ter no mínimo duas partidas.");
            }
        }
    });

    partidasContainer.addEventListener('input', updateTotals);
    partidasContainer.addEventListener('change', updateTotals);

    lancamentoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        const partidasColetadas = Array.from(partidasContainer.querySelectorAll('.partidas-grid')).map(partida => ({
            id_conta: parseInt(partida.querySelector('.conta-select').value),
            tipo_partida: partida.querySelector('.tipo-partida').value,
            valor: parseFloat(partida.querySelector('.valor-partida').value)
        }));

        const dadosTransacao = {
            data: document.getElementById('data').value,
            descricao: document.getElementById('descricao').value,
            partidas: partidasColetadas,
        };
        
        try {
            await createLancamento(dadosTransacao); 
            
            if (typeof showSystemNotification === 'function') {
                showSystemNotification('Lançamento salvo com sucesso!', 'success');
            } else {
                alert('Lançamento salvo!');
            }

            // Reset do form
            lancamentoForm.reset();
            partidasContainer.innerHTML = '';
            addPartida();
            addPartida();
            updateTotals(); 
            
            // REMOVIDO: Chamada para recarregar tabela

        } catch(error) {
           console.error("Falha ao criar lançamento:", error);
           addSummaryError(`Erro ao salvar: ${error.message}`);
        }
    });

    // Inicialização: Apenas carrega as contas
    await loadContas();
});