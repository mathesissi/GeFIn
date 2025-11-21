export class Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    senha?: string;
    id_empresa: number;

    constructor(
        id_usuario: number,
        nome: string,
        email: string,
        id_empresa: number,
        senha?: string,
    ) {
        this.id_usuario = id_usuario;
        this.nome = nome;
        this.email = email;
        this.id_empresa = id_empresa;
        this.senha = senha;
    }
}