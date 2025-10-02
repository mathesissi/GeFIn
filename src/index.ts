import express, { Request, Response, NextFunction } from 'express'; // Ajuste aqui para importar tipos
import { RegisterRoutes } from './route/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/Swagger';
import cors from 'cors';
import { ValidateError } from 'tsoa'; // Importar o erro de validação do TSOA

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Rota para a documentação do Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

RegisterRoutes(app);

// ----------------------------------------------------------------------
// MIDDLEWARE DE TRATAMENTO DE ERRO GLOBAL (Solução)
// ----------------------------------------------------------------------
app.use(function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. Tratamento de Erros de Validação do TSOA
    if (err instanceof ValidateError) {
        // console.warn(`Erro de Validação TSOA: ${err.status}`, err.fields);
        return res.status(400).json({
            message: "Erro de Validação na Requisição.",
            details: err.fields,
        });
    }

    // 2. Tratamento para Erros Lançados no Service (como "Já existe uma conta...")
    if (err instanceof Error) {
        // Se a mensagem do erro não foi tratada no Controller (o que acontece)
        // Retornamos 400 (Bad Request) e a mensagem de erro em JSON.
        return res.status(400).json({ 
            message: err.message 
        });
    }
    
    // 3. Tratamento de Erros de Servidor (Fallback para qualquer erro não mapeado)
    // console.error("Erro Não Tratado (500):", err);
    return res.status(500).json({
        message: "Erro Interno do Servidor. Contate o suporte.",
    });
});
// ----------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Swagger docs disponíveis em http://localhost:${port}/docs`);
});