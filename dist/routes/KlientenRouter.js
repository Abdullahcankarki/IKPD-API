"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const KlientenController_1 = require("../controller/KlientenController");
const JwtMiddleware_1 = require("../types/JwtMiddleware");
const router = express_1.default.Router();
// Alle Routen geschützt
router.use(JwtMiddleware_1.verifyToken);
// Klienten-Endpunkte
router.post('/', KlientenController_1.createKlient);
router.get('/meine', KlientenController_1.getMeineKlienten);
router.get('/:id', KlientenController_1.getKlientById);
router.put('/:id', KlientenController_1.updateKlient);
router.delete('/:id', KlientenController_1.deleteKlient);
exports.default = router;
