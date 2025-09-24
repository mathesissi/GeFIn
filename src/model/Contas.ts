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


//Subtipos para Patrimônio Líquido.

export enum SubtipoPatrimonioLiquido {
  Geral = 'Patrimônio Líquido'
}


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

    if (subtipo_conta && this.validarSubtipo(tipo_conta, subtipo_conta)) {
      this.subtipo_conta = subtipo_conta;
    } else if (subtipo_conta) {
      throw new Error(`Subtipo inválido "${subtipo_conta}" para o tipo "${tipo_conta}"`);
    }
  }

  private validarSubtipo(tipo: TipoConta, subtipo: string): boolean {
    switch (tipo) {
      case TipoConta.Ativo:
        return Object.values(SubtipoAtivo).includes(subtipo as SubtipoAtivo);
      case TipoConta.Passivo:
        return Object.values(SubtipoPassivo).includes(subtipo as SubtipoPassivo);
      case TipoConta.PatrimonioLiquido:
        return Object.values(SubtipoPatrimonioLiquido).includes(subtipo as SubtipoPatrimonioLiquido);
      default:
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