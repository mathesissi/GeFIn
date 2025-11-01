import express, { Request, Response, NextFunction } from 'express';
import { RegisterRoutes } from './route/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/Swagger';
import cors from 'cors';
import { ValidateError } from 'tsoa';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

RegisterRoutes(app);

app.use(function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ValidateError) {
        return res.status(400).json({
            message: "Erro de Validação na Requisição.",
            details: err.fields,
        });
    }

    if (err instanceof Error) {
        return res.status(400).json({
            message: err.message
        });
    }

    return res.status(500).json({
        message: "Erro Interno do Servidor. Contate o suporte.",
    });
});

// ----------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Swagger docs disponíveis em http://localhost:${port}/docs`);
});