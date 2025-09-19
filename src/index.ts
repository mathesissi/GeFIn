import express from 'express';
import { setupSwagger } from './config/Swagger';
import { RegisterRoutes } from './route/routes';
const app = express();

const PORT = 3040;

app.use(express.json());

const apiRouter = express.Router();
RegisterRoutes(apiRouter);

app.use('/api', apiRouter);

RegisterRoutes(app);
setupSwagger(app);


app.listen(PORT, () => console.log("API online na porta: " + PORT));