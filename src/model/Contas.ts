//Tipos principais de conta.

export enum TipoConta {
  Ativo = 'Ativo',
  Passivo = 'Passivo',
  PatrimonioLiquido = 'PatrimonioLiquido',
  Receita = 'Receita',
  Despesa = 'Despesa'
}


//Subtipos principais.

export enum SubtipoAtivo {
  Circulante = 'Ativo Circulante',
  NaoCirculante = 'Ativo Nao Circulante'
}

// Novos Subtipos Secundários para "Ativo Não Circulante"

export enum SubtipoSecundarioAtivo {
  RealizavelLongoPrazo = 'Realizavel a Longo Prazo',
  Investimento = 'Investimento',
  Imobilizado = 'Imobilizado',
  Intangivel = 'Intangivel'
}


// Subtipos para contas do tipo "Passivo".

export enum SubtipoPassivo {
  Circulante = 'Passivo Circulante',
  NaoCirculante = 'Passivo Nao Circulante'
}


//Representa uma conta contábil com seus atributos e lógica de validação.

export class Conta {
  id_conta: number;
  nome_conta: string;
  tipo_conta: TipoConta;
  subtipo_conta?: string;
  subtipo_secundario?: string;
  codigo_conta: string;


  constructor(
    id_conta: number,
    nome_conta: string,
    tipo_conta: TipoConta,
    codigo_conta: string,
    subtipo_conta?: string,
    subtipo_secundario?: string
  ) {
    this.id_conta = id_conta;
    this.nome_conta = nome_conta;
    this.tipo_conta = tipo_conta;
    this.codigo_conta = codigo_conta;

    const primarySubtype = subtipo_conta?.trim() || undefined;
    const secondarySubtype = subtipo_secundario?.trim() || undefined;

    const isPatrimonioLiquido = tipo_conta === TipoConta.PatrimonioLiquido;
    const isReceitaDespesa = tipo_conta === TipoConta.Receita || tipo_conta === TipoConta.Despesa;
    const isSubtypeMandatory = tipo_conta === TipoConta.Ativo || tipo_conta === TipoConta.Passivo;


    if (isPatrimonioLiquido || isReceitaDespesa) {
      this.subtipo_conta = undefined;
    } else if (isSubtypeMandatory) {
      if (!primarySubtype) {
        throw new Error(`Subtipo principal é obrigatório para contas do tipo "${tipo_conta}"`);
      }

      if (!this.validarSubtipo(tipo_conta, primarySubtype)) {
        throw new Error(`Subtipo principal inválido "${primarySubtype}" para o tipo "${tipo_conta}"`);
      }
      this.subtipo_conta = primarySubtype;
    } else if (primarySubtype) {
      throw new Error(`Subtipo principal não é permitido para o tipo "${tipo_conta}"`);
    } else {
      this.subtipo_conta = undefined;
    }

    const isAtivoNaoCirculante = tipo_conta === TipoConta.Ativo && primarySubtype === SubtipoAtivo.NaoCirculante;

    if (isAtivoNaoCirculante) {
      if (!secondarySubtype) {
        throw new Error(`Subtipo secundário é obrigatório para "${SubtipoAtivo.NaoCirculante}"`);
      }
      if (!this.validarSubtipoSecundario(secondarySubtype)) {
        throw new Error(`Subtipo secundário inválido "${secondarySubtype}" para "${SubtipoAtivo.NaoCirculante}"`);
      }
      this.subtipo_secundario = secondarySubtype;
    } else {
      this.subtipo_secundario = undefined;
    }
  }

  private validarSubtipo(tipo: TipoConta, subtipo: string): boolean {
    switch (tipo) {
      case TipoConta.Ativo:
        return Object.values(SubtipoAtivo).includes(subtipo as SubtipoAtivo);
      case TipoConta.Passivo:
        return Object.values(SubtipoPassivo).includes(subtipo as SubtipoPassivo);
      default:
        return false;
    }
  }

  private validarSubtipoSecundario(subtipoSecundario: string): boolean {
    return Object.values(SubtipoSecundarioAtivo).includes(subtipoSecundario as SubtipoSecundarioAtivo);
  }


  exibirConta(): void {
    console.log(`ID: ${this.id_conta}`);
    console.log(`Nome: ${this.nome_conta}`);
    console.log(`Tipo: ${this.tipo_conta}`);
    if (this.subtipo_conta) {
      console.log(`Subtipo: ${this.subtipo_conta}`);
    }
    if (this.subtipo_secundario) {
      console.log(`Subtipo Secundário: ${this.subtipo_secundario}`);
    }
    console.log(`Código: ${this.codigo_conta}`);
  }
}