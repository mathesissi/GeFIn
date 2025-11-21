"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(id_usuario, nome, email, id_empresa, senha) {
        this.id_usuario = id_usuario;
        this.nome = nome;
        this.email = email;
        this.id_empresa = id_empresa;
        this.senha = senha;
    }
}
exports.Usuario = Usuario;
