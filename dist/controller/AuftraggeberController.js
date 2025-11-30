"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuftraggeber = exports.updateAuftraggeber = exports.getAuftraggeberById = exports.getAlleAuftraggeber = exports.createAuftraggeber = void 0;
const zod_1 = require("zod");
const AuftraggeberModel_1 = __importDefault(require("../model/AuftraggeberModel"));
const auftraggeberSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    institution: zod_1.z.string().min(1),
    funktion: zod_1.z.string().min(1),
    adresse: zod_1.z.string().min(1),
    telefonnummer: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
});
const createAuftraggeber = async (req, res) => {
    try {
        const parsed = auftraggeberSchema.parse(req.body);
        const existing = await AuftraggeberModel_1.default.findOne({
            email: parsed.email,
            praxisId: req.user?.praxisId,
        });
        if (existing) {
            return res.status(409).json({ message: 'Auftraggeber mit dieser E-Mail existiert bereits.' });
        }
        const neuer = await AuftraggeberModel_1.default.create({
            ...parsed,
            praxisId: req.user?.praxisId,
        });
        res.status(201).json(neuer);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
    }
};
exports.createAuftraggeber = createAuftraggeber;
const getAlleAuftraggeber = async (req, res) => {
    try {
        const auftraggeber = await AuftraggeberModel_1.default.find({ praxisId: req.user?.praxisId });
        res.json(auftraggeber);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getAlleAuftraggeber = getAlleAuftraggeber;
const getAuftraggeberById = async (req, res) => {
    try {
        const ag = await AuftraggeberModel_1.default.findById(req.params.id);
        if (!ag)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (ag.praxisId.toString() !== req.user?.praxisId) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        res.json(ag);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getAuftraggeberById = getAuftraggeberById;
const updateAuftraggeber = async (req, res) => {
    try {
        const ag = await AuftraggeberModel_1.default.findById(req.params.id);
        if (!ag)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (ag.praxisId.toString() !== req.user?.praxisId) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const parsed = auftraggeberSchema.partial().parse(req.body);
        Object.assign(ag, parsed);
        await ag.save();
        res.json(ag);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
    }
};
exports.updateAuftraggeber = updateAuftraggeber;
const deleteAuftraggeber = async (req, res) => {
    try {
        const ag = await AuftraggeberModel_1.default.findById(req.params.id);
        if (!ag)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (ag.praxisId.toString() !== req.user?.praxisId) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        await ag.deleteOne();
        res.json({ message: 'Auftraggeber gelöscht' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
    }
};
exports.deleteAuftraggeber = deleteAuftraggeber;
