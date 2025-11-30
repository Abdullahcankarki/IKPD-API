"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTherapeut = exports.changePassword = exports.updateMe = exports.getMe = exports.createTherapeut = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const TherapeutModel_1 = __importDefault(require("../model/TherapeutModel"));
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const therapeutSchema = zod_1.z.object({
    username: zod_1.z.string(),
    vorname: zod_1.z.string(),
    nachname: zod_1.z.string(),
    email: zod_1.z.string().email(),
    telefonnummer: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6),
    rolle: zod_1.z.enum(['admin', 'therapeut']),
    praxisId: zod_1.z.string().optional(),
    stundensatz: zod_1.z.number().optional(),
    anfang: zod_1.z.string().optional(),
    wochenstunden: zod_1.z.number().optional(),
});
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await TherapeutModel_1.default.findOne({ username });
        if (!user)
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        const token = jsonwebtoken_1.default.sign({ _id: user._id, rolle: user.rolle, praxisId: user.praxisId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ message: 'Login fehlgeschlagen', error: err });
    }
};
exports.login = login;
const createTherapeut = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin')
            return res.status(403).json({ message: 'Nicht autorisiert' });
        const parsed = therapeutSchema.parse(req.body);
        const neuer = new TherapeutModel_1.default(parsed);
        await neuer.save();
        res.status(201).json({ message: 'Therapeut erstellt' });
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Erstellen', error: err.message });
    }
};
exports.createTherapeut = createTherapeut;
const getMe = async (req, res) => {
    try {
        const therapeut = await TherapeutModel_1.default.findById(req.user?._id).select('-password');
        res.json(therapeut);
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Laden', error: err.message });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const allowedFields = ['vorname', 'nachname', 'telefonnummer', 'email', 'praxisId'];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key])
                updates[key] = req.body[key];
        }
        const updated = await TherapeutModel_1.default.findByIdAndUpdate(req.user?._id, updates, { new: true }).select('-password');
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
    }
};
exports.updateMe = updateMe;
const changePassword = async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6)
        return res.status(400).json({ message: 'Passwort zu kurz' });
    try {
        const therapeut = await TherapeutModel_1.default.findById(req.user?._id);
        if (!therapeut)
            return res.status(404).json({ message: 'Nicht gefunden' });
        therapeut.password = password;
        await therapeut.save();
        res.json({ message: 'Passwort geändert' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Ändern', error: err.message });
    }
};
exports.changePassword = changePassword;
const deleteTherapeut = async (req, res) => {
    try {
        if (req.user?.rolle !== 'admin')
            return res.status(403).json({ message: 'Nicht autorisiert' });
        await TherapeutModel_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Therapeut gelöscht' });
    }
    catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
    }
};
exports.deleteTherapeut = deleteTherapeut;
