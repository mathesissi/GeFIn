// src/controller/BalanceteController.ts

import { Request, Response } from 'express';
import { BalanceteService } from '../service/BalanceteService';

export class BalanceteController {
    private balanceteService: BalanceteService;

    constructor(balanceteService: BalanceteService) {
        this.balanceteService = balanceteService;
    }

    /**
     * Endpoint para obter balancetes por período.
     * GET /api/balancetes?mes=...&ano=...
     */
    async getBalancetes(req: Request, res: Response): Promise<void> {
        try {
            const mes = parseInt(req.query.mes as string);
            const ano = parseInt(req.query.ano as string);
            
            if (isNaN(mes) || isNaN(ano)) {
                res.status(400).json({ message: "Os parâmetros 'mes' e 'ano' são obrigatórios e devem ser números." });
                return;
            }

            const balancetes = await this.balanceteService.getBalancetesPorPeriodo(mes, ano);
            res.status(200).json(balancetes);
        } catch (error) {
            // Verifica se o erro é uma instância da classe Error para acessar a propriedade 'message'
            if (error instanceof Error) {
                res.status(500).json({ message: "Ocorreu um erro ao buscar os balancetes.", error: error.message });
            } else {
                res.status(500).json({ message: "Ocorreu um erro desconhecido ao buscar os balancetes." });
            }
        }
    }

    /**
     * Endpoint para calcular e gerar os balancetes do período.
     * POST /api/balancetes/gerar
     */
    async postGerarBalancetes(req: Request, res: Response): Promise<void> {
        try {
            const { mes, ano } = req.body;

            if (!mes || !ano) {
                res.status(400).json({ message: "Os parâmetros 'mes' e 'ano' são obrigatórios no corpo da requisição." });
                return;
            }
            
            const novosBalancetes = await this.balanceteService.calcularEGerarBalancetes(mes, ano);
            res.status(201).json({ message: "Balancetes gerados com sucesso.", data: novosBalancetes });
        } catch (error) {
            // Verifica se o erro é uma instância da classe Error para acessar a propriedade 'message'
            if (error instanceof Error) {
                res.status(500).json({ message: "Ocorreu um erro ao gerar os balancetes.", error: error.message });
            } else {
                res.status(500).json({ message: "Ocorreu um erro desconhecido ao gerar os balancetes." });
            }
        }
    }
}