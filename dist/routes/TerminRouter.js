"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TerminController_1 = require("../controller/TerminController");
const JwtMiddleware_1 = require("../types/JwtMiddleware");
const router = express_1.default.Router();
router.use(JwtMiddleware_1.verifyToken);
router.post('/', TerminController_1.createTermin);
router.get('/meine', TerminController_1.getMeineTermine);
router.get('/praxis', TerminController_1.getPraxisTermine);
router.get('/:id', TerminController_1.getTerminById);
router.put('/:id', TerminController_1.updateTermin);
router.delete('/:id', TerminController_1.deleteTermin);
exports.default = router;
