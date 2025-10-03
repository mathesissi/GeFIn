"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// src/database/database.ts
const promise_1 = __importDefault(require("mysql2/promise"));
exports.db = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gefin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
console.log('Conexão com banco de dados configurada');
