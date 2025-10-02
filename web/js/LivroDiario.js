import { getContas, createLancamento, getLancamentos } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const addPartidaBtn = document.getElementById('add-partida');
    const partidasContainer = document.getElementById('partidas-container');
    const lancamentoForm = document.getElementById('lancamento-form');
    const lancamentosTbody = document.getElementById('lancamentos-historico-tbody'); // LINHA CORRIGIDA

    let contasCache = [];

    // --- Funções ---
    const loadContas = async () => {
        try {
            contasCache = await getContas();
            // Adiciona as duas primeiras partidas ao carregar as contas
            addPartida();
            addPartida();
        } catch (error) {
            console.error('Falha ao carregar contas para o formulário.');
        }
    };

    const createContaSelector = () => {
        const select = document.createElement('select');
        select.required = true;
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
            <select class="tipo-partida">
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
            </select>
            <input type="number" class="valor-partida" placeholder="0,00" step="0.01" required>
            <button type="button" class="btn-icon btn-danger remove-partida">
                <img src="../media/svg/delete.svg" alt="Remover">
            </button>
        `;
        newPartida.querySelector('.conta-select-wrapper').appendChild(contaSelect);
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
            } else {
                totalCredito += valor;
            }
        });

        document.getElementById('total-debito').textContent = `R$ ${totalDebito.toFixed(2)}`;
        document.getElementById('total-credito').textContent = `R$ ${totalCredito.toFixed(2)}`;
        
        const diferenca = totalDebito - totalCredito;
        document.getElementById('diferenca').textContent = `R$ ${diferenca.toFixed(2)}`;

        // Habilita o botão de salvar apenas se os totais forem iguais e maiores que zero
        const saveButton = document.getElementById('save-lancamento');
        if (totalDebito > 0 && totalDebito === totalCredito) {
            saveButton.disabled = false;
        } else {
            saveButton.disabled = true;
        }
    };
    
    const renderLancamentos = (lancamentos) => {
        lancamentosTbody.innerHTML = '';
        lancamentos.forEach(lanc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(lanc.data).toLocaleDateString('pt-BR')}</td>
                <td>${lanc.descricao}</td>
                <td>R$ ${parseFloat(lanc.valor).toFixed(2)}</td>
            `;
            lancamentosTbody.appendChild(tr);
        });
    };

    const loadAndRenderLancamentos = async () => {
        try {
            const lancamentos = await getLancamentos();
            renderLancamentos(lancamentos);
        } catch (error) {
            console.error('Falha ao carregar lançamentos.');
        }
    };

    // --- Event Listeners ---
    addPartidaBtn.addEventListener('click', addPartida);

    partidasContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-partida')) {
            e.target.closest('.partidas-grid').remove();
            updateTotals();
        }
    });

    partidasContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('valor-partida') || e.target.classList.contains('tipo-partida')) {
            updateTotals();
        }
    });

    lancamentoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const partidas = Array.from(partidasContainer.querySelectorAll('.partidas-grid'));
        const debitos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'debito');
        const creditos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'credito');

        // Simplificação para lançamento simples (um débito e um crédito)
        if (debitos.length !== 1 || creditos.length !== 1) {
            alert('Por enquanto, apenas lançamentos com um débito e um crédito são suportados.');
            return;
        }

        const lancamentoData = {
            data: document.getElementById('data').value,
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(debitos[0].querySelector('.valor-partida').value),
            id_conta_debito: parseInt(debitos[0].querySelector('select').value),
            id_conta_credito: parseInt(creditos[0].querySelector('select').value),
        };

        try {
            await createLancamento(lancamentoData);
            lancamentoForm.reset();
            partidasContainer.innerHTML = '';
            addPartida();
            addPartida();
            updateTotals();
            loadAndRenderLancamentos();
            alert('Lançamento salvo com sucesso!');
        } catch(error) {
           // Erro já tratado na API
        }
    });

    // --- Carregamento Inicial ---
    await loadContas();
    await loadAndRenderLancamentos();
});