"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTermin = exports.updateTermin = exports.getTerminById = exports.getPraxisTermine = exports.getMeineTermine = exports.createTermin = void 0;
const zod_1 = require("zod");
const TerminModel_1 = __importDefault(require("../model/TerminModel"));
const TherapeutModel_1 = __importDefault(require("../model/TherapeutModel"));
const KlientModel_1 = __importDefault(require("../model/KlientModel"));
const terminSchema = zod_1.z.object({
    datum: zod_1.z.string().datetime(),
    dauer: zod_1.z.number().min(1),
    beschreibung: zod_1.z.string().optional(),
    status: zod_1.z.enum(['geplant', 'abgeschlossen', 'abgesagt']),
    klientId: zod_1.z.string(),
    therapeutId: zod_1.z.string().optional(), // wird ggf. aus Token ermittelt
});
const createTermin = async (req, res) => {
    try {
        const parsed = terminSchema.parse(req.body);
        const klient = await KlientModel_1.default.findById(parsed.klientId);
        if (!klient)
            return res.status(404).json({ message: 'Klient nicht gefunden' });
        const istAdmin = req.user?.rolle === 'admin';
        const therapeutId = istAdmin && parsed.therapeutId ? parsed.therapeutId : req.user?._id;
        const therapeut = await TherapeutModel_1.default.findById(therapeutId);
        if (!therapeut)
            return res.status(404).json({ message: 'Therapeut nicht gefunden' });
        const neuerTermin = await TerminModel_1.default.create({
            datum: parsed.datum,
            dauer: parsed.dauer,
            beschreibung: parsed.beschreibung,
            status: parsed.status,
            klientId: klient._id,
            klientName: klient.name,
            therapeutId: therapeut._id,
            therapeutName: therapeut.vorname + " " + therapeut.nachname,
            praxisId: req.user?.praxisId,
        });
        res.status(201).json(neuerTermin);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
    }
};
exports.createTermin = createTermin;
const getMeineTermine = async (req, res) => {
    try {
        const termine = await TerminModel_1.default.find({
            therapeutId: req.user?._id,
        }).sort({ datum: 1 });
        res.json(termine);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getMeineTermine = getMeineTermine;
const getPraxisTermine = async (req, res) => {
    if (req.user?.rolle !== 'admin')
        return res.status(403).json({ message: 'Nicht autorisiert' });
    try {
        const termine = await TerminModel_1.default.find({
            praxisId: req.user?.praxisId,
        }).sort({ datum: 1 });
        res.json(termine);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getPraxisTermine = getPraxisTermine;
const getTerminById = async (req, res) => {
    try {
        const termin = await TerminModel_1.default.findById(req.params.id);
        if (!termin)
            return res.status(404).json({ message: 'Nicht gefunden' });
        const istAdmin = req.user?.rolle === 'admin';
        const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
        if (!istAdmin && !istEigener)
            return res.status(403).json({ message: 'Nicht autorisiert' });
        res.json(termin);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
    }
};
exports.getTerminById = getTerminById;
const updateTermin = async (req, res) => {
    try {
        const termin = await TerminModel_1.default.findById(req.params.id);
        if (!termin)
            return res.status(404).json({ message: 'Nicht gefunden' });
        const istAdmin = req.user?.rolle === 'admin';
        const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
        if (!istAdmin && !istEigener)
            return res.status(403).json({ message: 'Nicht autorisiert' });
        const parsed = terminSchema.partial().parse(req.body);
        if (parsed.therapeutId && istAdmin) {
            const therapeut = await TherapeutModel_1.default.findById(parsed.therapeutId);
            if (!therapeut)
                return res.status(404).json({ message: 'Therapeut nicht gefunden' });
            termin.therapeutId = therapeut._id;
            termin.therapeutName = therapeut.vorname + " " + therapeut.nachname;
        }
        if (parsed.klientId) {
            const klient = await KlientModel_1.default.findById(parsed.klientId);
            if (!klient)
                return res.status(404).json({ message: 'Klient nicht gefunden' });
            termin.klientId = klient._id;
            termin.klientName = klient.name;
        }
        Object.assign(termin, parsed);
        await termin.save();
        res.json(termin);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
    }
};
exports.updateTermin = updateTermin;
const deleteTermin = async (req, res) => {
    try {
        const termin = await TerminModel_1.default.findById(req.params.id);
        if (!termin)
            return res.status(404).json({ message: 'Nicht gefunden' });
        const istAdmin = req.user?.rolle === 'admin';
        const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
        if (!istAdmin && !istEigener)
            return res.status(403).json({ message: 'Nicht autorisiert' });
        await termin.deleteOne();
        res.json({ message: 'Termin gelöscht' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
    }
};
exports.deleteTermin = deleteTermin;
