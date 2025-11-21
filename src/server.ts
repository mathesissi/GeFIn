// server.ts

import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import 'reflect-metadata';

// Importa apenas a função de inicialização e o utilitário de query/pool
import { inicializarBancoDeDados } from "./database/MySql";
import { RegisterRoutes } from './route/routes'; // TSOA

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos
app.use('/web', express.static(path.join(__dirname, '../web')));

// ================= INICIALIZAÇÃO ASSÍNCRONA E INÍCIO DO SERVIDOR =================

async function startServer() {
  try {
    // ETAPA CRÍTICA: Inicializa o banco de dados e cria tabelas
    await inicializarBancoDeDados();

    // ROTAS DA API
    // Nota: Você precisará ajustar os Controllers e Services que usam SQL diretamente aqui
    // para usar a injeção de dependência e os filtros id_empresa.
    RegisterRoutes(app);

    // ERRO 404
    app.use((req, res) => {
      res.status(404).json({ message: 'Rota não encontrada' });
    });

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor ou conectar ao banco de dados:', error);
    process.exit(1);
  }
}

startServer();