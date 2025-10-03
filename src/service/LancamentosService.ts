import { Lancamento, Partida } from '../model/Lancamento';
import { LancamentosRepository } from '../repository/LancamentosRepository';
import { ContaRepository } from '../repository/ContasRepository'; 

/**
 * Interface para a nova estrutura de dados de entrada para a criação de um lançamento (transação composta).
 */
export interface DadosTransacao {
  data: string;
  descricao: string;
  partidas: Partida[];
}

export class LancamentosService {
  private lancamentosRepository: LancamentosRepository;
  private contaRepository: ContaRepository;

  constructor() {
    this.lancamentosRepository = LancamentosRepository.getInstance();
    this.contaRepository = ContaRepository.getInstance(); 
  }

  public async criarLancamento(dadosTransacao: DadosTransacao): Promise<Lancamento> {
    const { data, descricao, partidas } = dadosTransacao;

    // --- Validações de Cabeçalho ---
    if (!data || !descricao || typeof descricao !== 'string' || descricao.trim() === '') {
      throw new Error("Dados incompletos: data e descrição são obrigatórios.");
    }
    if (!Array.isArray(partidas) || partidas.length < 2) {
      throw new Error('Uma transação deve ter pelo menos duas partidas (débito e crédito).');
    }

    // --- Validação de Partidas ---
    let totalDebito = 0;
    let totalCredito = 0;
    const contasUsadas: number[] = [];

    for (const partida of partidas) {
      const { id_conta, tipo_partida, valor } = partida;

      if (!id_conta || !tipo_partida || typeof valor !== 'number' || valor <= 0) {
        throw new Error("Dados de partida inválidos: conta, tipo e valor positivo são obrigatórios para cada partida.");
      }

      if (tipo_partida === 'debito') {
        totalDebito += valor;
      } else if (tipo_partida === 'credito') {
        totalCredito += valor;
      } else {
        throw new Error(`Tipo de partida inválido: "${tipo_partida}". Deve ser "debito" ou "credito".`);
      }
      
      // Adiciona a conta para checagem de existência, evitando duplicidade
      if (!contasUsadas.includes(id_conta)) {
        contasUsadas.push(id_conta);
      }
    }
    
    // Validação do Princípio das Partidas Dobradas: Débitos = Créditos
    if (Math.abs(totalDebito - totalCredito) > 0.005 || totalDebito === 0) { // Tolerância para ponto flutuante
        throw new Error(`O total de débitos (R$ ${totalDebito.toFixed(2)}) deve ser igual ao total de créditos (R$ ${totalCredito.toFixed(2)}) e maior que zero. Diferença: R$ ${(totalDebito - totalCredito).toFixed(2)}`);
    }

    // Validação de existência de contas
    const contasExistentes = await Promise.all(contasUsadas.map(id => this.contaRepository.findById(id)));
    const contasInvalidas = contasUsadas.filter((_, index) => !contasExistentes[index]);

    if (contasInvalidas.length > 0) {
      throw new Error(`As seguintes contas não existem: ${contasInvalidas.join(', ')}.`);
    }

    // Cria a instância do modelo de transação
    const novoLancamento = new Lancamento(
      0, // ID 0 para novo lançamento
      new Date(data),
      descricao,
      totalDebito, // O valor total é a soma dos débitos (ou créditos)
      partidas
    );

    return this.lancamentosRepository.Create(novoLancamento);
  }

  /**
   * Busca um lançamento pelo ID.
   * @param id O ID do lançamento a ser buscado.
   * @returns O lançamento encontrado ou `null` se não existir.
   */
  public async buscarLancamentoPorId(id: number): Promise<Lancamento | null> {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
    }
    return this.lancamentosRepository.Select(id);
  }

  /**
   * Lista todos os lançamentos.
   * @returns Uma lista de todos os lançamentos.
   */
  public async listarLancamentos(): Promise<Lancamento[]> {
    return this.lancamentosRepository.findAll();
  }

  /**
   * Valida e atualiza um lançamento.
   * @param id O ID do lançamento a ser atualizado.
   * @param dadosAtualizados Os dados a serem atualizados no lançamento.
   * @returns O lançamento atualizado ou `null` se não for encontrado.
   */
  public async atualizarLancamento(id: number, dadosAtualizados: {
      data?: string;
      descricao?: string;
      partidas?: Partida[];
  }): Promise<Lancamento | null> {
    const lancamentoExistente = await this.lancamentosRepository.Select(id);

    if (!lancamentoExistente) {
      return null;
    }
    
    // Mescla dados antigos e novos
    const dadosMesclados: DadosTransacao = {
      data: dadosAtualizados.data || lancamentoExistente.data.toISOString().split('T')[0],
      descricao: dadosAtualizados.descricao || lancamentoExistente.descricao,
      partidas: dadosAtualizados.partidas || lancamentoExistente.partidas,
    };
    
    // Executa a validação completa
    let totalDebito = 0;
    let totalCredito = 0;
    const contasUsadas: number[] = [];

    if (!Array.isArray(dadosMesclados.partidas) || dadosMesclados.partidas.length < 2) {
      throw new Error('Uma transação deve ter pelo menos duas partidas (débito e crédito) na atualização.');
    }

    for (const partida of dadosMesclados.partidas) {
      const { id_conta, tipo_partida, valor } = partida;
      
      if (!id_conta || !tipo_partida || typeof valor !== 'number' || valor <= 0) {
        throw new Error("Dados de partida inválidos: conta, tipo e valor positivo são obrigatórios para cada partida na atualização.");
      }

      if (tipo_partida === 'debito') {
        totalDebito += valor;
      } else if (tipo_partida === 'credito') {
        totalCredito += valor;
      } else {
        throw new Error(`Tipo de partida inválido: "${tipo_partida}". Deve ser "debito" ou "credito" na atualização.`);
      }
      
      if (!contasUsadas.includes(id_conta)) {
        contasUsadas.push(id_conta);
      }
    }
    
    if (Math.abs(totalDebito - totalCredito) > 0.005) {
        throw new Error(`O total de débitos (R$ ${totalDebito.toFixed(2)}) deve ser igual ao total de créditos (R$ ${totalCredito.toFixed(2)}) na atualização.`);
    }

    const contasExistentes = await Promise.all(contasUsadas.map(id_conta => this.contaRepository.findById(id_conta)));
    const contasInvalidas = contasUsadas.filter((_, index) => !contasExistentes[index]);
    
    if (contasInvalidas.length > 0) {
        throw new Error(`As seguintes contas não existem: ${contasInvalidas.join(', ')}.`);
    }


    const lancamentoParaAtualizar = new Lancamento(
      id,
      new Date(dadosMesclados.data),
      dadosMesclados.descricao,
      totalDebito, 
      dadosMesclados.partidas
    );

    return this.lancamentosRepository.Update(lancamentoParaAtualizar);
  }

  /**
   * Deleta um lançamento após validações.
   * @param id O ID do lançamento a ser deletado.
   * @returns `true` se a deleção foi bem-sucedida, `false` caso contrário.
   */
  public async deletarLancamento(id: number): Promise<boolean> {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('O ID do lançamento deve ser um número inteiro positivo.');
    }
    const lancamentoExistente = await this.lancamentosRepository.Select(id);
    if (!lancamentoExistente) {
      return false;
    }
    return this.lancamentosRepository.Delete(id);
  }
}