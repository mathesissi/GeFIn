import express from 'express';
import { RegisterRoutes } from './route/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/Swagger';
import cors from 'cors'; // <--- 1. IMPORTE O PACOTE CORS AQUI

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors()); // <--- 2. ADICIONE ESTA LINHA AQUI

// Rota para a documentação do Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

RegisterRoutes(app);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Swagger docs disponíveis em http://localhost:${port}/docs`);
});