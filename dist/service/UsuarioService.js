"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const Usuario_1 = require("../model/Usuario");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_DE_DESENVOLVIMENTO_PADRAO';
function generateAuthToken(usuario) {
    return jsonwebtoken_1.default.sign({
        id_usuario: usuario.id_usuario,
        id_empresa: usuario.id_empresa,
        email: usuario.email
    }, JWT_SECRET, { expiresIn: '1d' });
}
class UsuarioService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Cria um novo usuário com e-mail e senha para uma empresa existente.
     * @param nome Nome do usuário.
     * @param email E-mail do usuário.
     * @param senha Senha em texto plano (obrigatória).
     * @param id_empresa ID da empresa existente (obrigatório após validação externa).
     */
    async criarUsuarioComSenha(nome, email, senha, id_empresa) {
        // 0. Validações de Presença
        if (!nome || nome.trim() === '') {
            throw new Error("Nome é obrigatório.");
        }
        if (!email || email.trim() === '') {
            throw new Error("E-mail é obrigatório.");
        }
        if (!senha || senha.length < 6) {
            throw new Error("Senha deve ter no mínimo 6 caracteres.");
        }
        // Validação adicional do ID da empresa (garantir que seja um número válido)
        if (!id_empresa || typeof id_empresa !== 'number' || id_empresa <= 0) {
            throw new Error("ID da empresa inválido.");
        }
        // 1. Verifica unicidade de E-mail
        const usuarioExistente = await this.repository.findByEmail(email);
        if (usuarioExistente) {
            throw new Error("Um usuário com este e-mail já está cadastrado.");
        }
        // 2. Hashing da Senha
        const salt = await bcryptjs_1.default.genSalt(10);
        const senhaHash = await bcryptjs_1.default.hash(senha, salt);
        // 3. Criação do Usuário
        const novoUsuario = new Usuario_1.Usuario(0, nome, email, id_empresa, senhaHash);
        return this.repository.create(novoUsuario);
    }
    /**
     * Autentica um usuário com e-mail e senha.
     * @param email E-mail do usuário.
     * @param senha Senha em texto plano.
     * @returns Uma promessa que resolve para um objeto AuthResult.
     */
    async signInWithPassword(email, senha) {
        // 1. Busca o usuário pelo e-mail
        const usuario = await this.repository.findByEmail(email);
        if (!usuario) {
            throw new Error("Credenciais inválidas."); // Mensagem genérica por segurança
        }
        // 2. Verifica se a conta possui senha local (criada via Sign-up)
        if (!usuario.senha) {
            throw new Error("Esta conta foi criada por outro método (ex: Google) ou não possui senha.");
        }
        // 3. Compara a senha fornecida com o hash salvo no banco
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new Error("Credenciais inválidas."); // Mensagem genérica por segurança
        }
        // 4. Gera e retorna o token
        const token = generateAuthToken(usuario);
        return { token, usuario };
    }
    /**
     * @param id O ID do usuário.
     * @param id_empresa O ID da empresa logada (filtro de segurança).
     * @returns O objeto Usuario ou null.
     */
    async buscarUsuarioPorId(id, id_empresa) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID do usuário deve ser um número inteiro positivo.');
        }
        return this.repository.findById(id, id_empresa);
    }
    async buscarUsuarioPorEmail(email) {
        if (!email || email.trim() === '') {
            throw new Error("E-mail é obrigatório.");
        }
        return this.repository.findByEmail(email);
    }
    /**
     * @param id_empresa O ID da empresa logada (filtro de segurança).
     * @returns Uma lista de objetos Usuario.
     */
    async listarUsuarios(id_empresa) {
        return this.repository.findAll(id_empresa);
    }
    /**
     * @param usuario Objeto Usuario com os dados atualizados.
     * @param id_empresa O ID da empresa logada.
     * @returns O objeto Usuario atualizado ou null.
     */
    async atualizarDadosUsuario(usuario, id_empresa) {
        if (usuario.id_empresa !== id_empresa) {
            throw new Error("Acesso negado. O usuário não pertence à empresa atual.");
        }
        return this.repository.update(usuario);
    }
    /**
     * Deleta um usuário, restrito à empresa do contexto.
     * @param id O ID do usuário a ser deletado.
     * @param id_empresa O ID da empresa logada.
     * @returns True se deletado, False caso contrário.
     */
    async deletarUsuario(id, id_empresa) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('O ID do usuário para deleção é inválido.');
        }
        return this.repository.delete(id, id_empresa);
    }
}
exports.UsuarioService = UsuarioService;
