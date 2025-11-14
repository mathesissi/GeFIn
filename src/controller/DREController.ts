import express from "express";
import { DREService } from "../service/DREService";

export const DREController = express.Router();

DREController.get("/:ano", async (req, res) => {
  try {
    const ano = Number(req.params.ano);
    const dre = await DREService.gerarDRE(ano);
    res.json(dre);
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});
