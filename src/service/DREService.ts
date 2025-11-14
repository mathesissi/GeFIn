import { DRE } from "../model/DRE";
import { DRELine } from "../model/DRELine";

import { ContasService } from "./ContasService";
import { LancamentosService } from "./LancamentosService";

class _DREService {

    async gerarDRE(ano: number, mes: number | null = null): Promise<DRE> {
        const dre = new DRE(ano, mes);

        const contas = await ContasService.buscarTodasContas();
        const lancamentos = await LancamentosService.buscarPorPeriodo(ano, mes);

        const valoresPorConta: Record<string, number> = {};

        for (const l of lancamentos) {
            const codigo = l.conta;

            if (!valoresPorConta[codigo]) {
                valoresPorConta[codigo] = 0;
            }

            valoresPorConta[codigo] += Number(l.valor || 0);
        }

        // Associa cada conta às linhas do DRE
        for (const c of contas) {

            // Só conta se tiver classificação DRE
            if (!c.dre_grupo) continue;

            const valor = valoresPorConta[c.codigo] || 0;

            dre.adicionarLinha(
                new DRELine(
                    c.dre_codigo || null,
                    c.descricao,
                    valor,
                    c.dre_grupo
                )
            );
        }

        return dre;
    }
}

export const DREService = new _DREService();
