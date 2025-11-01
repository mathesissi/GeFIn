import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Usuario } from '../model/Usuario';
import { Empresa } from '../model/Empresa';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { EmpresaRepository } from '../repository/EmpresaRepository';

// ID do Cliente do Google (substitua pelo seu valor)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'SEU_CLIENT_ID_PADRAO';
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_SECRETO_PARA_ASSINATURA_JWT';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface AuthResult {
    token: string;
    usuario: Usuario;
}

export class AuthService {
    private usuarioRepo: UsuarioRepository;
    private empresaRepo: EmpresaRepository;

    constructor(usuarioRepo: UsuarioRepository, empresaRepo: EmpresaRepository) {
        this.usuarioRepo = usuarioRepo;
        this.empresaRepo = empresaRepo;
    }

    private generateAuthToken(usuario: Usuario): string {
        return jwt.sign(
            { id_usuario: usuario.id_usuario, id_empresa: usuario.id_empresa, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
    }

    async signInWithGoogle(idToken: string): Promise<AuthResult> {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub) {
            throw new Error("Token do Google inválido ou incompleto.");
        }

        const { email, name, sub: googleId } = payload;

        let usuario = await this.usuarioRepo.findByEmail(email);

        // 1. Se o usuário NÃO existe, precisamos criá-lo e criar a Empresa
        if (!usuario) {
            // **Criação de Nova Empresa (Auto-criação na primeira conta)**
            const novaEmpresa = new Empresa(0, `${name}'s Company`, '99999999999999');
            const empresaCriada = await this.empresaRepo.create(novaEmpresa);

            // **Criação de Novo Usuário**
            const novoUsuario = new Usuario(
                0,
                name!,
                email,
                empresaCriada.id_empresa, // Associa à nova empresa
                undefined,
                googleId
            );
            usuario = await this.usuarioRepo.create(novoUsuario);
        } else if (!usuario.google_id) {
            // Se o usuário já existe (ex: criado com senha), mas está fazendo login via Google pela primeira vez,
            // atualiza o campo google_id.
            // Implementação de atualização é necessária.
        }

        if (!usuario) {
            throw new Error("Erro desconhecido ao criar/encontrar usuário.");
        }

        const token = this.generateAuthToken(usuario);

        return { token, usuario };
    }
}