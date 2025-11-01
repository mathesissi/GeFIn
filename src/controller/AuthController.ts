import { Controller, Post, Route, Body, SuccessResponse } from 'tsoa';
import { AuthService } from '../service/AuthService';

@Route("auth")
export class AuthController extends Controller {
    private authService: AuthService;

    constructor(authService: AuthService) {
        super();
        this.authService = authService;
    }

    @SuccessResponse("200", "Login bem-sucedido")
    @Post("google")
    public async signInWithGoogle(
        @Body() body: { token: string }
    ): Promise<{ token: string, user: any }> {
        const { token, usuario } = await this.authService.signInWithGoogle(body.token);

        return {
            token,
            user: {
                id: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                id_empresa: usuario.id_empresa
            }
        };
    }
}