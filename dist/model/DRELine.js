"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRELine = void 0;
class DRELine {
    constructor(params) {
        this.codigo = params.codigo ?? null;
        this.descricao = params.descricao;
        this.valor = params.valor ?? 0;
        this.tipo = params.tipo;
        this.children = params.children ?? [];
        this.nivel = params.nivel ?? 1;
    }
    addChild(line) {
        this.children.push(line);
    }
    // Soma recursiva (Seus filhos somam os filhos deles, etc.)
    calcularTotal() {
        if (this.children.length > 0) {
            this.valor = this.children.reduce((acc, child) => {
                // Se o filho também é um grupo, garante que ele calculou primeiro
                if (child.children.length > 0)
                    child.calcularTotal();
                return acc + child.valor;
            }, 0);
        }
    }
}
exports.DRELine = DRELine;
