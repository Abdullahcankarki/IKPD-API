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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const TherapeutSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    vorname: { type: String, required: true },
    nachname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefonnummer: { type: String },
    password: { type: String, required: true },
    rolle: { type: String, enum: ['admin', 'therapeut'], required: true },
    praxisId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Praxis' },
    stundensatz: { type: Number },
    anfang: { type: Date, default: Date.now },
    wochenstunden: { type: Number, default: 0 },
}, { timestamps: true });
// Passwort hashen vor dem Speichern
TherapeutSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt_1.default.hash(this.password, 10);
    next();
});
// Passwortvergleichsmethode
TherapeutSchema.methods.comparePassword = async function (password) {
    return bcrypt_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model('Therapeut', TherapeutSchema);
