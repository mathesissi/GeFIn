import { Usuario } from "../model/Usuario";
import { executarComandoSQL } from "../database/MySql";

export class UsuarioRepository {
    private static instance: UsuarioRepository;
    private constructor() {
        this.createTable();
    }

    public static getInstance(): UsuarioRepository {
        if (!UsuarioRepository.instance) {
            UsuarioRepository.instance = new UsuarioRepository();
        }
        return UsuarioRepository.instance;
    }
    private async createTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255),
            google_id VARCHAR(255) UNIQUE,
            id_empresa INT NOT NULL,
            FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
        );
    `;
        try {
            await executarComandoSQL(sql, []);
            console.log('Tabela "usuarios" criada ou já existente.');
        } catch (error) {
            console.error('Erro ao criar tabela "usuarios":', error);
        }
    }

    private rowToUsuario(row: any): Usuario {
        return new Usuario(
            row.id_usuario,
            row.nome,
            row.email,
            row.id_empresa,
            row.senha || undefined,
            row.google_id || undefined
        );
    }

    async create(usuario: Usuario): Promise<Usuario> {
        const sql = `INSERT INTO usuarios (nome, email, senha, google_id, id_empresa) VALUES (?, ?, ?, ?, ?);`;
        const params = [usuario.nome, usuario.email, usuario.senha, usuario.google_id, usuario.id_empresa];
        const result = await executarComandoSQL(sql, params);
        const newId = result.insertId;

        const created = await this.findById(newId);
        if (!created) throw new Error("Erro ao criar usuário");
        return created;
    }

    async findById(id: number): Promise<Usuario | null> {
        const sql = "SELECT * FROM usuarios WHERE id_usuario = ?;";
        const result = await executarComandoSQL(sql, [id]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const sql = "SELECT * FROM usuarios WHERE email = ?;";
        const result = await executarComandoSQL(sql, [email]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }

    async findByGoogleId(googleId: string): Promise<Usuario | null> {
        const sql = "SELECT * FROM usuarios WHERE google_id = ?;";
        const result = await executarComandoSQL(sql, [googleId]);
        return result.length > 0 ? this.rowToUsuario(result[0]) : null;
    }
    async findAll(): Promise<Usuario[]> {
        const sql = "SELECT * FROM usuarios ORDER BY nome;";
        const result = await executarComandoSQL(sql, []);
        return result.map((row: any) => this.rowToUsuario(row));
    }

    async update(usuario: Usuario): Promise<Usuario | null> {
        const sql = `
      UPDATE usuarios
      SET nome = ?, email = ?, senha = ?, google_id = ?, id_empresa = ?
      WHERE id_usuario = ?;
    `;
        const params = [
            usuario.nome,
            usuario.email,
            usuario.senha || null,
            usuario.google_id || null,
            usuario.id_empresa,
            usuario.id_usuario,
        ];
        await executarComandoSQL(sql, params);
        return this.findById(usuario.id_usuario);
    }

    async delete(id: number): Promise<boolean> {
        const sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        const result = await executarComandoSQL(sql, [id]);
        return result.affectedRows > 0;
    }

}