"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PraxisController_1 = require("../controller/PraxisController");
const JwtMiddleware_1 = require("../types/JwtMiddleware");
const router = express_1.default.Router();
// Auth-Middleware für alle Praxis-Routen
router.use(JwtMiddleware_1.verifyToken);
// Neue Praxis anlegen – nur für Admins
router.post('/', PraxisController_1.createPraxis);
// Alle Praxen abrufen – nur für Admins
router.get('/', PraxisController_1.getAllPraxen);
// Eigene Praxen für Therapeut
router.get('/meine', PraxisController_1.getMeinePraxen);
// Praxis löschen – nur für Admins
router.delete('/:id', PraxisController_1.deletePraxis);
// Praxis aktualisieren – nur für Admins
router.put('/:id', PraxisController_1.updatePraxis);
exports.default = router;
