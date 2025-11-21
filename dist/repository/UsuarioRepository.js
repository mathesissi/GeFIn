"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepository = void 0;
const Usuario_1 = require("../model/Usuario");
const MySql_1 = require("../database/MySql");
class UsuarioRepository {
    constructor() {
    }
    static getInstance() {
        if (!UsuarioRepository.instance) {
            UsuarioRepository.instance = new UsuarioRepository();
        }
        return UsuarioRepository.instance;
    }
    rowToUsuario(row) {
        return new Usuario_1.Usuario(row.id_usuario, row.nome, row.email, row.id_empresa, row.senha // A senha (hash) é retornada aqui para uso no login
        );
    }
    async create(usuario) {
        const sql = `INSERT INTO usuarios (nome, email, senha, id_empresa) VALUES (?, ?, ?, ?);`;
        // Garantimos que a senha seja null se não for fornecida (embora o signup force a senha)
        const params = [
            usuario.nome,
            usuario.email,
            usuario.senha || null,
            usuario.id_empresa
        ];
        const result = await (0, MySql_1.executarComandoSQL)(sql, params);
        const newId = result.insertId;
        const created = await this.findById(newId, usuario.id_empresa);
        if (!created)
            throw new Error("Erro ao criar usuário");
        return created;
    }
    async findById(id, id_empresa) {
        const sql = "SELECT * FROM usuarios WHERE id_usuario = ? AND id_empresa = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id, id_empresa]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }
    async findByEmail(email) {
        // Busca sem filtro de id_empresa, pois o e-mail deve ser único globalmente
        const sql = "SELECT * FROM usuarios WHERE email = ?;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [email]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }
    async findAll(id_empresa) {
        const sql = "SELECT * FROM usuarios WHERE id_empresa = ? ORDER BY nome;";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id_empresa]);
        return result.map((row) => this.rowToUsuario(row));
    }
    async update(usuario) {
        // CORREÇÃO: Alinha o SQL com os parâmetros do modelo (removendo google_id)
        const sql = `
            UPDATE usuarios
            SET nome = ?, email = ?, senha = ?
            WHERE id_usuario = ? AND id_empresa = ?;
        `;
        const params = [
            usuario.nome,
            usuario.email,
            usuario.senha || null, // Garante que é null se não houver senha
            usuario.id_usuario, // WHERE 1
            usuario.id_empresa, // WHERE 2 (Segurança)
        ];
        await (0, MySql_1.executarComandoSQL)(sql, params);
        return this.findById(usuario.id_usuario, usuario.id_empresa);
    }
    async delete(id, id_empresa) {
        const sql = "DELETE FROM usuarios WHERE id_usuario = ? AND id_empresa = ?";
        const result = await (0, MySql_1.executarComandoSQL)(sql, [id, id_empresa]);
        return result.affectedRows > 0;
    }
}
exports.UsuarioRepository = UsuarioRepository;
