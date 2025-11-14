import express, { Request, Response } from "express";
export const DREController = express.Router();

import { DREService } from "../service/DREService";

DREController.get("/:ano/:mes?", async (req: Request, res: Response) => {
    try {
        const ano = Number(req.params.ano);
        const mes = req.params.mes ? Number(req.params.mes) : null;

        const dre = await DREService.gerarDRE(ano, mes);

        res.json(dre);

    } catch (error: any) {
        res.status(500).json({ erro: error.message });
    }
});
