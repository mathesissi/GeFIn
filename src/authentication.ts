// src/authentication.ts
import * as express from 'express';
import * as jwt from 'jsonwebtoken';

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === 'jwt') {
        // CORREÇÃO: Uso de ?. para evitar erro se body ou query forem undefined
        const token =
            request.body?.token ||
            request.query?.token ||
            request.headers?.['x-access-token'] ||
            request.headers?.['authorization'];

        return new Promise((resolve, reject) => {
            if (!token) {
                // Opcional: Retornar erro específico ou rejeitar silenciosamente para o TSOA tratar
                reject(new Error("No token provided"));
                return;
            }

            // Remove 'Bearer ' se estiver presente (comum em headers)
            const cleanToken = token.replace("Bearer ", "");

            jwt.verify(cleanToken, process.env.JWT_SECRET || 'SEGREDO_DE_DESENVOLVIMENTO_PADRAO', function (err: any, decoded: any) {
                if (err) {
                    reject(new Error("Token inválido ou expirado"));
                } else {
                    // Sucesso: O payload do token (decoded) será injetado em request.user
                    resolve(decoded);
                }
            });
        });
    }

    return Promise.reject(new Error("Security Name not supported"));
}