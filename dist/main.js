"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
async function loadContas() {
    const response = await fetch('http://localhost:3000/api/contas');
    const contas = await response.json();
    const list = document.getElementById('contas-list');
    contas.forEach((c) => {
        const li = document.createElement('li');
        li.textContent = `${c.codigo_conta} - ${c.nome_conta} (${c.tipo_conta})`;
        list.appendChild(li);
    });
}
loadContas();
//# sourceMappingURL=main.js.map