"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const swaggerFile = path_1.default.join(__dirname, '../swagger.json');
exports.swaggerSpec = JSON.parse(fs_1.default.readFileSync(swaggerFile, 'utf8'));
const setupSwagger = (app) => {
    app.use('/gefin-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
};
exports.setupSwagger = setupSwagger;
