// src/controller/BalanceteController.ts
import { Request, Response } from 'express';
import { BalanceteService } from '../service/BalanceteService';

export class BalanceteController {
  private service = new BalanceteService();

  public async getBalancete(req: Request, res: Response) {
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);

    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ error: 'Mês e Ano são obrigatórios' });
    }

    try {
      const balancete = await this.service.getBalancete(mes, ano);
      return res.json(balancete);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar balancete' });
    }
  }
}
