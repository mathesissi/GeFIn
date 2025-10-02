//Tipos principais de conta.

export enum TipoConta {
  Ativo = 'Ativo',
  Passivo = 'Passivo',
  PatrimonioLiquido = 'Patrimônio Líquido',
  Receita = 'Receita',
  Despesa = 'Despesa'
}


//Subtipos para contas do tipo "Ativo".

export enum SubtipoAtivo {
  Circulante = 'Ativo Circulante',
  NaoCirculante_Realizavel = 'Realizável a Longo Prazo',
  NaoCirculante_Investimento = 'Investimento',
  NaoCirculante_Imobilizado = 'Imobilizado',
  NaoCirculante_Intangivel = 'Intangível'
}


// Subtipos para contas do tipo "Passivo".

export enum SubtipoPassivo {
  Circulante = 'Passivo Circulante',
  NaoCirculante = 'Passivo Não Circulante'
}


// [REMOVIDO: SubtipoPatrimonioLiquido redundante]


//Representa uma conta contábil com seus atributos e lógica de validação.

export class Conta {
  id_conta: number;
  nome_conta: string;
  tipo_conta: TipoConta;
  subtipo_conta?: string;
  codigo_conta: string;


  constructor(
    id_conta: number,
    nome_conta: string,
    tipo_conta: TipoConta,
    codigo_conta: string,
    subtipo_conta?: string
  ) {
    this.id_conta = id_conta;
    this.nome_conta = nome_conta;
    this.tipo_conta = tipo_conta;
    this.codigo_conta = codigo_conta;

    // [MODIFICADO] Se for Patrimônio Líquido, o subtipo deve ser ignorado/aceito como vazio, se não for, valida.
    const isPatrimonioLiquido = tipo_conta === TipoConta.PatrimonioLiquido;
    const isReceitaDespesa = tipo_conta === TipoConta.Receita || tipo_conta === TipoConta.Despesa;

    // Se um subtipo foi fornecido e a conta não é Patrimônio Líquido/Receita/Despesa (onde o subtipo é opcional/ignorado), deve ser validado.
    if (subtipo_conta && !isPatrimonioLiquido && !isReceitaDespesa && this.validarSubtipo(tipo_conta, subtipo_conta)) {
      this.subtipo_conta = subtipo_conta;
    } else if (subtipo_conta && !isPatrimonioLiquido && !isReceitaDespesa) {
      // Se fornecido e falhou na validação
      throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
    } else if (isPatrimonioLiquido || isReceitaDespesa) {
        // Para Patrimônio Líquido, Receita e Despesa, o campo subtipo é opcional/ignorado no back-end,
        // mas pode ter vindo vazio ou null. Apenas garantimos que ele não seja um subtipo de outro tipo.
        this.subtipo_conta = undefined;
    } else if (subtipo_conta) {
        // Se a conta exige subtipo e ele veio inválido, lança o erro (Ex: Ativo com subtipo inválido)
        throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
    }
  }

  private validarSubtipo(tipo: TipoConta, subtipo: string): boolean {
    switch (tipo) {
      case TipoConta.Ativo:
        return Object.values(SubtipoAtivo).includes(subtipo as SubtipoAtivo);
      case TipoConta.Passivo:
        return Object.values(SubtipoPassivo).includes(subtipo as SubtipoPassivo);
      // [REMOVIDO: case TipoConta.PatrimonioLiquido]
      default:
        // Receita, Despesa e outros não listados não requerem validação específica aqui.
        return false;
    }
  }


  exibirConta(): void {
    console.log(`ID: ${this.id_conta}`);
    console.log(`Nome: ${this.nome_conta}`);
    console.log(`Tipo: ${this.tipo_conta}`);
    if (this.subtipo_conta) {
      console.log(`Subtipo: ${this.subtipo_conta}`);
    }
    console.log(`Código: ${this.codigo_conta}`);
  }
}