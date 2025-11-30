"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RechnungController_1 = require("../controller/RechnungController");
const JwtMiddleware_1 = require("../types/JwtMiddleware");
const router = express_1.default.Router();
// Neue Rechnung erstellen
router.post("/", JwtMiddleware_1.verifyToken, RechnungController_1.createRechnung);
// Alle Rechnungen abrufen
router.get("/", JwtMiddleware_1.verifyToken, RechnungController_1.getRechnungen);
// Einzelne Rechnung abrufen
router.get("/:id", JwtMiddleware_1.verifyToken, RechnungController_1.getRechnung);
// Rechnung aktualisieren
router.patch("/:id", JwtMiddleware_1.verifyToken, RechnungController_1.updateRechnung);
// Rechnung löschen
router.delete("/:id", JwtMiddleware_1.verifyToken, RechnungController_1.deleteRechnung);
// Alle Rechnungen eines bestimmten Klienten
router.get("/von-klient/:klientId", JwtMiddleware_1.verifyToken, RechnungController_1.getRechnungenVonKlient);
// PDF einer Rechnung erstellen
router.get("/:id/pdf", JwtMiddleware_1.verifyToken, RechnungController_1.createRechnungPDF);
exports.default = router;
