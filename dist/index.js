"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const PraxisRouter_1 = __importDefault(require("./routes/PraxisRouter"));
const TherapeutenRouter_1 = __importDefault(require("./routes/TherapeutenRouter"));
const KlientenRouter_1 = __importDefault(require("./routes/KlientenRouter"));
const AuftraggeberRouter_1 = __importDefault(require("./routes/AuftraggeberRouter"));
const TerminRouter_1 = __importDefault(require("./routes/TerminRouter"));
const RechnungRouter_1 = __importDefault(require("./routes/RechnungRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5555;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API-Routen
app.use('/api/praxen', PraxisRouter_1.default);
app.use('/api/therapeut', TherapeutenRouter_1.default);
app.use('/api/klienten', KlientenRouter_1.default);
app.use('/api/auftraggeber', AuftraggeberRouter_1.default);
app.use('/api/termine', TerminRouter_1.default);
app.use('/api/rechnungen', RechnungRouter_1.default);
// Test route
app.get('/', (_req, res) => {
    res.send('Psychotherapie-Backend läuft 🚀');
});
// MongoDB-Verbindung
mongoose_1.default
    .connect(process.env.MONGO_URI || '')
    .then(() => {
    console.log('✅ MongoDB verbunden');
    app.listen(PORT, () => {
        console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('❌ Fehler bei MongoDB-Verbindung:', err);
});
