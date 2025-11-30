"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TherapeutController_1 = require("../controller/TherapeutController");
const router = express_1.default.Router();
// Auth-Middleware für alle geschützten Routen außer Login
router.use((req, res, next) => {
    if (req.path === '/login')
        return next();
    return require('../types/JwtMiddleware').verifyToken(req, res, next);
});
// Login (öffentlich)
router.post('/login', TherapeutController_1.login);
// Therapeut erstellen – nur Admin
router.post('/', TherapeutController_1.createTherapeut);
router.get('/all', TherapeutController_1.getAllTherapeuten);
// Eigene Daten abrufen
router.get('/me', TherapeutController_1.getMe);
// Eigene Daten aktualisieren
router.put('/me', TherapeutController_1.updateMe);
// Passwort ändern
router.put('/me/password', TherapeutController_1.changePassword);
// Therapeut löschen – nur Admin
router.delete('/:id', TherapeutController_1.deleteTherapeut);
router.put('/:id', TherapeutController_1.updateTherapeutById);
exports.default = router;
