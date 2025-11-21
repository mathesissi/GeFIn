import { DRELine } from "./DRELine";

export class DRE {
  mes: number;
  ano: number;
  root: DRELine; // A raiz da árvore (contém todos os filhos)

  constructor(mes: number, ano: number, root: DRELine) {
    this.mes = mes;
    this.ano = ano;
    this.root = root;
  }
}
