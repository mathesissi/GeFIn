import { getContas, createLancamento, getLancamentos } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referências aos Elementos ---
    const addPartidaBtn = document.getElementById('add-partida');
    const partidasContainer = document.getElementById('partidas-container');
    const lancamentoForm = document.getElementById('lancamento-form');
    const lancamentosTbody = document.getElementById('lancamentos-historico-tbody');
    const saveButton = document.getElementById('save-lancamento');

    let contasCache = [];

    // --- Funções ---

    /**
     * Carrega as contas da API e as armazena em cache.
     */
    const loadContas = async () => {
        try {
            contasCache = await getContas();
            // Adiciona as duas primeiras partidas iniciais
            addPartida();
            addPartida();
        } catch (error) {
            console.error('Falha ao carregar contas para o formulário.');
        }
    };

    /**
     * Cria um elemento <select> populado com as contas em cache.
     * @returns {HTMLSelectElement} O elemento select criado.
     */
    const createContaSelector = () => {
        const select = document.createElement('select');
        select.className = 'conta-select'; // Adicionada classe para seleção precisa
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

    /**
     * Adiciona uma nova linha de partida (débito/crédito) ao formulário.
     */
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
            <button type="button" class="btn-icon btn-danger remove-partida" title="Remover Partida">
                <img src="../media/svg/delete.svg" alt="Remover">
            </button>
        `;
        newPartida.querySelector('.conta-select-wrapper').appendChild(contaSelect);
        partidasContainer.appendChild(newPartida);
        updateTotals();
    };

    /**
     * Calcula e exibe os totais de débito, crédito e a diferença.
     * Habilita/desabilita o botão Salvar.
     */
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

        // Habilita o botão se os totais forem iguais, maiores que zero e a diferença for zero.
        saveButton.disabled = !(totalDebito > 0 && diferenca === 0);
    };
    
    /**
     * Renderiza a tabela de histórico de lançamentos.
     * @param {Array} lancamentos - A lista de lançamentos vinda da API.
     */
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

    /**
     * Busca os lançamentos da API e os renderiza na tabela.
     */
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

    partidasContainer.addEventListener('input', () => {
        updateTotals();
    });
    partidasContainer.addEventListener('change', () => { // Adicionado para capturar mudanças no select de Débito/Crédito
        updateTotals();
    });

    lancamentoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const partidas = Array.from(partidasContainer.querySelectorAll('.partidas-grid'));
        const debitos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'debito');
        const creditos = partidas.filter(p => p.querySelector('.tipo-partida').value === 'credito');

        // Simplificação para lançamento simples (um débito e um crédito)
        if (debitos.length !== 1 || creditos.length !== 1) {
            alert('Atenção: Apenas lançamentos com uma única partida de débito e uma de crédito são suportados no momento.');
            return;
        }

        // *** CORREÇÃO APLICADA AQUI ***
        // Seleciona o '.conta-select' especificamente para débito e crédito.
        const lancamentoData = {
            data: document.getElementById('data').value,
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(debitos[0].querySelector('.valor-partida').value),
            id_conta_debito: parseInt(debitos[0].querySelector('.conta-select').value),
            id_conta_credito: parseInt(creditos[0].querySelector('.conta-select').value),
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
           // O erro já é exibido na função fetchAPI
        }
    });

    // --- Carregamento Inicial ---
    await loadContas();
    await loadAndRenderLancamentos();
});