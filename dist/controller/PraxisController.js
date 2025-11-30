"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePraxis = exports.deletePraxis = exports.getMeinePraxen = exports.getAllPraxen = exports.createPraxis = void 0;
const PraxisModel_1 = __importDefault(require("../model/PraxisModel"));
const zod_1 = require("zod");
// Zod-Schema zur Validierung von Praxiseingaben
const praxisSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    adresse: zod_1.z.string().min(1),
    telefonnummer: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    therapeuten: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string(),
        vorname: zod_1.z.string(),
        nachname: zod_1.z.string(),
    })).optional(),
});
const createPraxis = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin') {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const parsed = praxisSchema.parse(req.body);
        const neuePraxis = await PraxisModel_1.default.create(parsed);
        res.status(201).json(neuePraxis);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Erstellen', error: err.message });
    }
};
exports.createPraxis = createPraxis;
const getAllPraxen = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin') {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const praxen = await PraxisModel_1.default.find();
        res.json(praxen);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getAllPraxen = getAllPraxen;
const getMeinePraxen = async (req, res) => {
    try {
        if (req.user?.rolle !== 'therapeut') {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const praxen = await PraxisModel_1.default.find({ 'therapeuten._id': req.user._id });
        res.json(praxen);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getMeinePraxen = getMeinePraxen;
const deletePraxis = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin') {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        await PraxisModel_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Praxis gelöscht' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
    }
};
exports.deletePraxis = deletePraxis;
const updatePraxis = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin') {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const parsed = praxisSchema.parse(req.body);
        const aktualisiertePraxis = await PraxisModel_1.default.findByIdAndUpdate(req.params.id, parsed, { new: true });
        if (!aktualisiertePraxis) {
            return res.status(404).json({ message: 'Praxis nicht gefunden' });
        }
        res.json(aktualisiertePraxis);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
    }
};
exports.updatePraxis = updatePraxis;
