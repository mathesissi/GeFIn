//Tipos principais de conta.

export enum TipoConta {
  Ativo = 'Ativo',
  Passivo = 'Passivo',
  PatrimonioLiquido = 'Patrimonio Liquido', // Valor padronizado com espaço
  Receita = 'Receita',
  Despesa = 'Despesa'
}


//Subtipos principais.

export enum SubtipoAtivo {
  Circulante = 'Ativo Circulante', // Mantido com espaço
  NaoCirculante = 'Ativo Nao Circulante' // Valor padronizado com espaço
}

// Novos Subtipos Secundários para "Ativo Não Circulante"

export enum SubtipoSecundarioAtivo {
  RealizavelLongoPrazo = 'Realizavel a Longo Prazo', // Valor padronizado com espaços
  Investimento = 'Investimento',
  Imobilizado = 'Imobilizado',
  Intangivel = 'Intangivel' // Valor padronizado
}


// Subtipos para contas do tipo "Passivo".

export enum SubtipoPassivo {
  Circulante = 'Passivo Circulante', // Mantido com espaço
  NaoCirculante = 'Passivo Nao Circulante' // Valor padronizado com espaço
}


//Representa uma conta contábil com seus atributos e lógica de validação.

export class Conta {
  id_conta: number;
  nome_conta: string;
  tipo_conta: TipoConta;
  subtipo_conta?: string;
  subtipo_secundario?: string; // Novo campo para o segundo nível de subtipo
  codigo_conta: string;


  constructor(
    id_conta: number,
    nome_conta: string,
    tipo_conta: TipoConta,
    codigo_conta: string,
    subtipo_conta?: string,
    subtipo_secundario?: string // Novo parâmetro
  ) {
    this.id_conta = id_conta;
    this.nome_conta = nome_conta;
    this.tipo_conta = tipo_conta;
    this.codigo_conta = codigo_conta;
    
    // Limpa strings vazias, especialmente para campos opcionais vindos do formulário
    const primarySubtype = subtipo_conta?.trim() || undefined; 
    const secondarySubtype = subtipo_secundario?.trim() || undefined;

    const isPatrimonioLiquido = tipo_conta === TipoConta.PatrimonioLiquido;
    const isReceitaDespesa = tipo_conta === TipoConta.Receita || tipo_conta === TipoConta.Despesa;
    const isSubtypeMandatory = tipo_conta === TipoConta.Ativo || tipo_conta === TipoConta.Passivo;


    // 1. Validação do Subtipo Principal
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

    // 2. Validação do Subtipo Secundário
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
        // ESSENCIAL: Garante que o campo é ignorado se não for o caso específico
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