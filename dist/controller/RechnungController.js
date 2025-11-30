"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRechnungenVonKlient = exports.updateRechnung = exports.deleteRechnung = exports.getRechnung = exports.getRechnungen = exports.createRechnungPDF = exports.createRechnung = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const RechnungsModel_1 = __importDefault(require("../model/RechnungsModel"));
const TerminModel_1 = __importDefault(require("../model/TerminModel"));
const TherapeutModel_1 = __importDefault(require("../model/TherapeutModel"));
const KlientModel_1 = __importDefault(require("../model/KlientModel"));
const AuftraggeberModel_1 = __importDefault(require("../model/AuftraggeberModel"));
const PraxisModel_1 = __importDefault(require("../model/PraxisModel"));
// Hilfsfunktion zum Erzeugen einer Rechnungsnummer
async function generateRechnungsnummer(jahr, monat) {
    const count = await RechnungsModel_1.default.countDocuments({ jahr, monat });
    const laufnummer = String(count + 1).padStart(3, "0");
    return `RE-${jahr}-${String(monat).padStart(2, "0")}-${laufnummer}`;
}
const createRechnung = async (req, res) => {
    try {
        const { monat, jahr, klientId, artDerMassnahme, rechnungsnummer, umsatzsteuer = 0, } = req.body;
        const user = req.user;
        const istAdmin = user.rolle === "admin";
        // Prüfen, ob bereits eine Rechnung existiert
        const bereitsVorhanden = await RechnungsModel_1.default.findOne({ klientId, monat, jahr });
        if (bereitsVorhanden) {
            return res
                .status(400)
                .json({ message: "Für diesen Klienten existiert bereits eine Rechnung in diesem Monat." });
        }
        // Klient holen
        const klient = await KlientModel_1.default.findById(klientId);
        if (!klient)
            return res.status(404).json({ message: "Klient nicht gefunden" });
        // AuftraggeberId aus Klient holen (Array beachten)
        const auftraggeberId = Array.isArray(klient.auftraggeberNamen) &&
            klient.auftraggeberNamen.length > 0
            ? klient.auftraggeberNamen[0]?.toString?.()
            : null;
        // Optionale übergebene TherapeutId, sonst eingeloggter Therapeut
        const therapeutId = istAdmin ? req.body.therapeutId || user._id : user._id;
        const therapeut = await TherapeutModel_1.default.findById(therapeutId);
        if (!therapeut)
            return res.status(404).json({ message: "Therapeut nicht gefunden" });
        // Alle Termine im Monat finden
        const start = new Date(jahr, monat - 1, 1);
        const end = new Date(jahr, monat, 0, 23, 59, 59);
        const termine = await TerminModel_1.default.find({
            klientId,
            therapeutId,
            datum: { $gte: start, $lte: end },
        });
        if (!termine.length) {
            return res
                .status(400)
                .json({ message: "Keine Termine im angegebenen Zeitraum gefunden" });
        }
        // Termine aufbereiten
        const aufbereiteteTermine = termine.map((t) => ({
            datum: t.datum,
            dauer: t.dauer,
            beschreibung: t.beschreibung,
            therapeutName: therapeut.vorname + " " + therapeut.nachname,
        }));
        // Stundensumme berechnen
        const gesamtMinuten = termine.reduce((sum, t) => sum + t.dauer, 0);
        const gesamtStunden = Math.round((gesamtMinuten / 60) * 100) / 100;
        const stundensatz = therapeut.stundensatz;
        const gesamtBetrag = Math.round(gesamtStunden * stundensatz * 100) / 100;
        // Praxisinformationen
        const praxis = await PraxisModel_1.default.findById(therapeut.praxisId);
        if (!praxis)
            return res.status(404).json({ message: "Praxis nicht gefunden" });
        // Auftraggeberdaten
        const auftraggeber = auftraggeberId
            ? await AuftraggeberModel_1.default.findById(auftraggeberId)
            : null;
        // Rechnungsnummer erzeugen (wenn nicht übergeben)
        const nummer = rechnungsnummer && rechnungsnummer.trim() !== ""
            ? rechnungsnummer
            : await generateRechnungsnummer(jahr, monat);
        // Rechnung speichern
        const rechnung = await RechnungsModel_1.default.create({
            monat,
            jahr,
            rechnungsdatum: new Date(),
            rechnungsnummer: nummer,
            umsatzsteuer,
            klientId: klient._id,
            klientName: klient.name,
            geburtsdatum: klient.geburtsdatum,
            artDerMassnahme,
            auftraggeberId: auftraggeber?._id,
            auftraggeberName: auftraggeber?.name,
            empfaenger: auftraggeber ? "auftraggeber" : "klient",
            termine: aufbereiteteTermine,
            gesamtStunden,
            stundensatz,
            gesamtBetrag,
            praxisInfo: {
                name: praxis.name,
                adresse: praxis.adresse,
                telefonnummer: praxis.telefonnummer,
                email: praxis.email,
                iban: praxis.iban,
                bankname: praxis.bankname,
                bic: praxis.bic,
            },
            praxisId: praxis._id,
            erstelltVon: user._id,
        });
        res.status(201).json(rechnung);
    }
    catch (err) {
        console.error("Fehler beim Erstellen der Rechnung:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.createRechnung = createRechnung;
const createRechnungPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const rechnung = await RechnungsModel_1.default.findById(id);
        if (!rechnung) {
            return res.status(404).json({ message: "Rechnung nicht gefunden" });
        }
        const doc = new pdfkit_1.default({ margin: 50 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="Rechnung-${rechnung.rechnungsnummer}.pdf"`);
            res.send(pdfBuffer);
        });
        // Header
        doc
            .fontSize(18)
            .text(`Rechnung ${rechnung.rechnungsnummer}`, { align: "right" });
        doc.moveDown();
        doc
            .fontSize(12)
            .text(`Rechnungsdatum: ${new Date(rechnung.rechnungsdatum).toLocaleDateString()}`, { align: "right" });
        // Praxis
        doc.moveDown().fontSize(14).text(`${rechnung.praxisInfo?.name}`);
        doc.fontSize(10).text(rechnung.praxisInfo?.adresse || "");
        doc.text(`Tel: ${rechnung.praxisInfo?.telefonnummer || ""} | E-Mail: ${rechnung.praxisInfo?.email || ""}`);
        doc.moveDown();
        // Empfänger
        doc.fontSize(12).text(`Rechnung an:`);
        if (rechnung.empfaenger === "auftraggeber") {
            doc.text(`${rechnung.auftraggeberName || ""}`);
        }
        else {
            doc.text(`${rechnung.klientName || ""}`);
        }
        doc.moveDown();
        doc.text(`Geburtsdatum Klient: ${new Date(rechnung.geburtsdatum).toLocaleDateString()}`);
        doc.text(`Art der Maßnahme: ${rechnung.artDerMassnahme}`);
        doc.moveDown();
        // Termine
        doc.fontSize(12).text("Leistungen:", { underline: true });
        rechnung.termine.forEach((t) => {
            doc.text(`• ${new Date(t.datum).toLocaleDateString()} – ${t.dauer} Min – ${t.beschreibung || "ohne Beschreibung"} (${t.therapeutName}, ${t.qualifikation})`);
        });
        doc.moveDown();
        doc.text(`Gesamtstunden: ${rechnung.gesamtStunden}`);
        doc.text(`Stundensatz: ${rechnung.stundensatz} €`);
        doc.text(`Umsatzsteuer: ${rechnung.umsatzsteuer}%`);
        doc.moveDown();
        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .text(`Gesamtbetrag: ${rechnung.gesamtBetrag.toFixed(2)} €`);
        doc.font("Helvetica"); // wieder zurück zur normalen Schrift, wenn nötig
        doc.end();
    }
    catch (err) {
        console.error("Fehler beim PDF-Export:", err);
        res.status(500).json({ message: "Fehler beim Erzeugen des PDFs" });
    }
};
exports.createRechnungPDF = createRechnungPDF;
// Alle Rechnungen auflisten (Admin sieht alle, Therapeut nur eigene)
const getRechnungen = async (req, res) => {
    try {
        const user = req.user;
        const filter = user.rolle === "admin" ? {} : { erstelltVon: user._id };
        const rechnungen = await RechnungsModel_1.default.find(filter).sort({ rechnungsdatum: -1 });
        res.json(rechnungen);
    }
    catch (err) {
        console.error("Fehler beim Laden der Rechnungen:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.getRechnungen = getRechnungen;
// Einzelne Rechnung anzeigen
const getRechnung = async (req, res) => {
    try {
        const rechnung = await RechnungsModel_1.default.findById(req.params.id);
        if (!rechnung)
            return res.status(404).json({ message: "Nicht gefunden" });
        res.json(rechnung);
    }
    catch (err) {
        console.error("Fehler beim Laden der Rechnung:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.getRechnung = getRechnung;
// Rechnung löschen
const deleteRechnung = async (req, res) => {
    try {
        const result = await RechnungsModel_1.default.findByIdAndDelete(req.params.id);
        if (!result)
            return res.status(404).json({ message: "Nicht gefunden" });
        res.json({ message: "Rechnung gelöscht" });
    }
    catch (err) {
        console.error("Fehler beim Löschen:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.deleteRechnung = deleteRechnung;
// Rechnung aktualisieren
const updateRechnung = async (req, res) => {
    try {
        const updated = await RechnungsModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: "Nicht gefunden" });
        res.json(updated);
    }
    catch (err) {
        console.error("Fehler beim Aktualisieren:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.updateRechnung = updateRechnung;
// Alle Rechnungen eines bestimmten Klienten abrufen
const getRechnungenVonKlient = async (req, res) => {
    try {
        const { klientId } = req.params;
        const user = req.user;
        const filter = { klientId };
        // Nur eigene Rechnungen sehen, außer Admin
        if (user.rolle !== "admin") {
            filter.erstelltVon = user._id;
        }
        const rechnungen = await RechnungsModel_1.default.find(filter).sort({ rechnungsdatum: -1 });
        res.json(rechnungen);
    }
    catch (err) {
        console.error("Fehler beim Laden der Rechnungen für Klient:", err);
        res.status(500).json({ message: "Serverfehler" });
    }
};
exports.getRechnungenVonKlient = getRechnungenVonKlient;
