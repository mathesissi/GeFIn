"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jwt = __importStar(require("jsonwebtoken"));
function expressAuthentication(request, securityName, scopes) {
    if (securityName === 'jwt') {
        // CORREÇÃO: Uso de ?. para evitar erro se body ou query forem undefined
        const token = request.body?.token ||
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
            jwt.verify(cleanToken, process.env.JWT_SECRET || 'SEGREDO_DE_DESENVOLVIMENTO_PADRAO', function (err, decoded) {
                if (err) {
                    reject(new Error("Token inválido ou expirado"));
                }
                else {
                    // Sucesso: O payload do token (decoded) será injetado em request.user
                    resolve(decoded);
                }
            });
        });
    }
    return Promise.reject(new Error("Security Name not supported"));
}
