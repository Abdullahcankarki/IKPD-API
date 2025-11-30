"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKlient = exports.updateKlient = exports.getKlientById = exports.getMeineKlienten = exports.createKlient = void 0;
const zod_1 = require("zod");
const KlientModel_1 = __importDefault(require("../model/KlientModel"));
const klientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    geburtsdatum: zod_1.z.string(), // ISO format
    adresse: zod_1.z.string().optional(),
    telefonnummer: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    kontaktperson: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        telefonnummer: zod_1.z.string().optional(),
    })
        .optional(),
    auftraggeberNamen: zod_1.z.array(zod_1.z.string()),
});
const berechneAlter = (geburtsdatum) => {
    const heute = new Date();
    let alter = heute.getFullYear() - geburtsdatum.getFullYear();
    const m = heute.getMonth() - geburtsdatum.getMonth();
    if (m < 0 || (m === 0 && heute.getDate() < geburtsdatum.getDate())) {
        alter--;
    }
    return alter;
};
const createKlient = async (req, res) => {
    try {
        const parsed = klientSchema.parse(req.body);
        const neuer = await KlientModel_1.default.create({
            ...parsed,
            geburtsdatum: new Date(parsed.geburtsdatum),
            praxisId: req.user?.praxisId,
            therapeutId: req.user?._id,
        });
        res.status(201).json({
            ...neuer.toObject(),
            alter: berechneAlter(neuer.geburtsdatum),
        });
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
    }
};
exports.createKlient = createKlient;
const getMeineKlienten = async (req, res) => {
    try {
        const filter = req.user?.rolle === 'admin'
            ? { praxisId: req.user.praxisId }
            : { therapeutId: req.user?._id };
        const klienten = await KlientModel_1.default.find(filter);
        const result = klienten.map(k => ({
            ...k.toObject(),
            alter: berechneAlter(k.geburtsdatum),
        }));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getMeineKlienten = getMeineKlienten;
const getKlientById = async (req, res) => {
    try {
        const klient = await KlientModel_1.default.findById(req.params.id);
        if (!klient)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (req.user?.rolle !== 'admin' &&
            klient.therapeutId.toString() !== req.user?._id) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        res.json({
            ...klient.toObject(),
            alter: berechneAlter(klient.geburtsdatum),
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getKlientById = getKlientById;
const updateKlient = async (req, res) => {
    try {
        const klient = await KlientModel_1.default.findById(req.params.id);
        if (!klient)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (req.user?.rolle !== 'admin' &&
            klient.therapeutId.toString() !== req.user?._id) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        const parsed = klientSchema.partial().parse(req.body);
        Object.assign(klient, parsed);
        await klient.save();
        res.json({
            ...klient.toObject(),
            alter: berechneAlter(klient.geburtsdatum),
        });
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
    }
};
exports.updateKlient = updateKlient;
const deleteKlient = async (req, res) => {
    try {
        const klient = await KlientModel_1.default.findById(req.params.id);
        if (!klient)
            return res.status(404).json({ message: 'Nicht gefunden' });
        if (req.user?.rolle !== 'admin' &&
            klient.therapeutId.toString() !== req.user?._id) {
            return res.status(403).json({ message: 'Nicht autorisiert' });
        }
        await klient.deleteOne();
        res.json({ message: 'Klient gelöscht' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
    }
};
exports.deleteKlient = deleteKlient;
