export class Empresa {
    id_empresa: number;
    razao_social: string;
    cnpj: string;

    constructor(id_empresa: number, razao_social: string, cnpj: string) {
        this.id_empresa = id_empresa;
        this.razao_social = razao_social;
        this.cnpj = cnpj;
    }
}