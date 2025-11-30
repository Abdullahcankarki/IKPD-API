"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Wir speichern Termine nicht als Referenz, sondern betten sie direkt in die Rechnung ein.
// Grund: Eine Rechnung muss auch Jahre später noch denselben Datenstand haben.
// Wenn wir stattdessen Termin-IDs referenzieren würden, könnten spätere Änderungen am Termin-Modell die Rechnung verfälschen.
// Dieses Schema speichert also eine "Momentaufnahme" der Termin-Daten für jede Rechnung.
const terminSchema = new mongoose_1.Schema({
    datum: { type: Date, required: true },
    dauer: { type: Number, required: true },
    beschreibung: { type: String },
    therapeutName: { type: String, required: true },
    qualifikation: { type: String, required: true },
});
const praxisInfoSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    adresse: { type: String, required: true },
    telefonnummer: { type: String },
    email: { type: String },
    iban: { type: String },
    bankname: { type: String },
    bic: { type: String },
});
const rechnungSchema = new mongoose_1.Schema({
    monat: { type: Number, required: true },
    jahr: { type: Number, required: true },
    rechnungsdatum: { type: Date, required: true },
    rechnungsnummer: { type: String, required: true },
    umsatzsteuer: { type: Number, enum: [0, 7, 19], required: true },
    klientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Klient', required: true },
    klientName: { type: String, required: true },
    geburtsdatum: { type: Date, required: true },
    artDerMassnahme: { type: String, required: true },
    auftraggeberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Auftraggeber' },
    auftraggeberName: { type: String },
    empfaenger: { type: String, enum: ['klient', 'auftraggeber'], required: true },
    termine: [terminSchema],
    gesamtStunden: { type: Number, required: true },
    stundensatz: { type: Number, required: true },
    gesamtBetrag: { type: Number, required: true },
    praxisInfo: praxisInfoSchema,
    praxisId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Praxis', required: true },
    erstelltVon: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
exports.default = mongoose_1.default.model('Rechnung', rechnungSchema);
