"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteController = void 0;
const BalanceteService_1 = require("../service/BalanceteService");
class BalanceteController {
    constructor() {
        this.service = new BalanceteService_1.BalanceteService();
    }
    getBalancete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const mes = parseInt(req.query.mes);
            const ano = parseInt(req.query.ano);
            if (isNaN(mes) || isNaN(ano)) {
                return res.status(400).json({ error: 'Mês e Ano são obrigatórios' });
            }
            try {
                const balancete = yield this.service.getBalancete(mes, ano);
                return res.json(balancete);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao buscar balancete' });
            }
        });
    }
}
exports.BalanceteController = BalanceteController;
