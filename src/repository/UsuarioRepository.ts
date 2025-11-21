import { Usuario } from "../model/Usuario";
import { executarComandoSQL } from "../database/MySql";

export class UsuarioRepository {
    private static instance: UsuarioRepository;

    private constructor() {

    }

    public static getInstance(): UsuarioRepository {
        if (!UsuarioRepository.instance) {
            UsuarioRepository.instance = new UsuarioRepository();
        }
        return UsuarioRepository.instance;
    }


    private rowToUsuario(row: any): Usuario {
        return new Usuario(
            row.id_usuario,
            row.nome,
            row.email,
            row.id_empresa,
            row.senha // A senha (hash) é retornada aqui para uso no login
        );
    }

    async create(usuario: Usuario): Promise<Usuario> {
        const sql = `INSERT INTO usuarios (nome, email, senha, id_empresa) VALUES (?, ?, ?, ?);`;
        // Garantimos que a senha seja null se não for fornecida (embora o signup force a senha)
        const params = [
            usuario.nome,
            usuario.email,
            usuario.senha || null,
            usuario.id_empresa
        ];
        const result = await executarComandoSQL(sql, params);
        const newId = result.insertId;

        const created = await this.findById(newId, usuario.id_empresa);
        if (!created) throw new Error("Erro ao criar usuário");
        return created;
    }

    async findById(id: number, id_empresa: number): Promise<Usuario | null> {
        const sql = "SELECT * FROM usuarios WHERE id_usuario = ? AND id_empresa = ?;";
        const result = await executarComandoSQL(sql, [id, id_empresa]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        // Busca sem filtro de id_empresa, pois o e-mail deve ser único globalmente
        const sql = "SELECT * FROM usuarios WHERE email = ?;";
        const result = await executarComandoSQL(sql, [email]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }


    async findAll(id_empresa: number): Promise<Usuario[]> {
        const sql = "SELECT * FROM usuarios WHERE id_empresa = ? ORDER BY nome;";
        const result = await executarComandoSQL(sql, [id_empresa]);
        return result.map((row: any) => this.rowToUsuario(row));
    }

    async update(usuario: Usuario): Promise<Usuario | null> {
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
        await executarComandoSQL(sql, params);
        return this.findById(usuario.id_usuario, usuario.id_empresa);
    }
    async delete(id: number, id_empresa: number): Promise<boolean> {
        const sql = "DELETE FROM usuarios WHERE id_usuario = ? AND id_empresa = ?";
        const result = await executarComandoSQL(sql, [id, id_empresa]);
        return result.affectedRows > 0;
    }
}