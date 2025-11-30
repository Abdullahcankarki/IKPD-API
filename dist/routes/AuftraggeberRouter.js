"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuftraggeberController_1 = require("../controller/AuftraggeberController");
const JwtMiddleware_1 = require("../types/JwtMiddleware");
const router = express_1.default.Router();
router.use(JwtMiddleware_1.verifyToken);
router.post('/', AuftraggeberController_1.createAuftraggeber);
router.get('/', AuftraggeberController_1.getAlleAuftraggeber);
router.get('/:id', AuftraggeberController_1.getAuftraggeberById);
router.put('/:id', AuftraggeberController_1.updateAuftraggeber);
router.delete('/:id', AuftraggeberController_1.deleteAuftraggeber);
exports.default = router;
