import PDFDocument from "pdfkit";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import Rechnung from "../model/RechnungsModel";
import Termin from "../model/TerminModel";
import Therapeut from "../model/TherapeutModel";
import Klient from "../model/KlientModel";
import Auftraggeber from "../model/AuftraggeberModel";
import Praxis from "../model/PraxisModel";

// Hilfsfunktion zum Erzeugen einer Rechnungsnummer
async function generateRechnungsnummer(
  jahr: number,
  monat: number
): Promise<string> {
  const count = await Rechnung.countDocuments({ jahr, monat });
  const laufnummer = String(count + 1).padStart(3, "0");
  return `RE-${jahr}-${String(monat).padStart(2, "0")}-${laufnummer}`;
}

export const createRechnung = async (req: AuthRequest, res: Response) => {
  try {
    const {
      monat,
      jahr,
      klientId,
      artDerMassnahme,
      rechnungsnummer,
      umsatzsteuer = 0,
    } = req.body;

    const user = req.user!;
    const istAdmin = user.rolle === "admin";

    // Prüfen, ob bereits eine Rechnung existiert
    const bereitsVorhanden = await Rechnung.findOne({ klientId, monat, jahr });
    if (bereitsVorhanden) {
      return res
        .status(400)
        .json({ message: "Für diesen Klienten existiert bereits eine Rechnung in diesem Monat." });
    }
    // Klient holen
    const klient = await Klient.findById(klientId);
    if (!klient)
      return res.status(404).json({ message: "Klient nicht gefunden" });

    // AuftraggeberId aus Klient holen (Array beachten)
    const auftraggeberId =
      Array.isArray(klient.auftraggeberNamen) &&
      klient.auftraggeberNamen.length > 0
        ? klient.auftraggeberNamen[0]?.toString?.()
        : null;

    // Optionale übergebene TherapeutId, sonst eingeloggter Therapeut
    const therapeutId = istAdmin ? req.body.therapeutId || user._id : user._id;

    const therapeut = await Therapeut.findById(therapeutId);
    if (!therapeut)
      return res.status(404).json({ message: "Therapeut nicht gefunden" });

    // Alle Termine im Monat finden
    const start = new Date(jahr, monat - 1, 1);
    const end = new Date(jahr, monat, 0, 23, 59, 59);
    const termine = await Termin.find({
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
    const gesamtBetrag = Math.round(gesamtStunden * stundensatz! * 100) / 100;

    // Praxisinformationen
    const praxis = await Praxis.findById(therapeut.praxisId);
    if (!praxis)
      return res.status(404).json({ message: "Praxis nicht gefunden" });

    // Auftraggeberdaten
    const auftraggeber = auftraggeberId
      ? await Auftraggeber.findById(auftraggeberId)
      : null;

    // Rechnungsnummer erzeugen (wenn nicht übergeben)
    const nummer =
      rechnungsnummer && rechnungsnummer.trim() !== ""
        ? rechnungsnummer
        : await generateRechnungsnummer(jahr, monat);

    // Rechnung speichern
    const rechnung = await Rechnung.create({
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
  } catch (err) {
    console.error("Fehler beim Erstellen der Rechnung:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};

export const createRechnungPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const rechnung = await Rechnung.findById(id);
    if (!rechnung) {
      return res.status(404).json({ message: "Rechnung nicht gefunden" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const chunks: any[] = [];

    doc.on("data", (chunk: any) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="Rechnung-${rechnung.rechnungsnummer}.pdf"`
      );
      res.send(pdfBuffer);
    });

    // Header
    doc
      .fontSize(18)
      .text(`Rechnung ${rechnung.rechnungsnummer}`, { align: "right" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Rechnungsdatum: ${new Date(
          rechnung.rechnungsdatum
        ).toLocaleDateString()}`,
        { align: "right" }
      );

    // Praxis
    doc.moveDown().fontSize(14).text(`${rechnung.praxisInfo?.name}`);
    doc.fontSize(10).text(rechnung.praxisInfo?.adresse || "");
    doc.text(
      `Tel: ${rechnung.praxisInfo?.telefonnummer || ""} | E-Mail: ${
        rechnung.praxisInfo?.email || ""
      }`
    );
    doc.moveDown();

    // Empfänger
    doc.fontSize(12).text(`Rechnung an:`);
    if (rechnung.empfaenger === "auftraggeber") {
      doc.text(`${rechnung.auftraggeberName || ""}`);
    } else {
      doc.text(`${rechnung.klientName || ""}`);
    }

    doc.moveDown();
    doc.text(
      `Geburtsdatum Klient: ${new Date(
        rechnung.geburtsdatum
      ).toLocaleDateString()}`
    );
    doc.text(`Art der Maßnahme: ${rechnung.artDerMassnahme}`);
    doc.moveDown();

    // Termine
    doc.fontSize(12).text("Leistungen:", { underline: true });
    rechnung.termine.forEach((t: any) => {
      doc.text(
        `• ${new Date(t.datum).toLocaleDateString()} – ${t.dauer} Min – ${
          t.beschreibung || "ohne Beschreibung"
        } (${t.therapeutName}, ${t.qualifikation})`
      );
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
  } catch (err) {
    console.error("Fehler beim PDF-Export:", err);
    res.status(500).json({ message: "Fehler beim Erzeugen des PDFs" });
  }
};

// Alle Rechnungen auflisten (Admin sieht alle, Therapeut nur eigene)
export const getRechnungen = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const filter = user.rolle === "admin" ? {} : { erstelltVon: user._id };
    const rechnungen = await Rechnung.find(filter).sort({ rechnungsdatum: -1 });
    res.json(rechnungen);
  } catch (err) {
    console.error("Fehler beim Laden der Rechnungen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};

// Einzelne Rechnung anzeigen
export const getRechnung = async (req: AuthRequest, res: Response) => {
  try {
    const rechnung = await Rechnung.findById(req.params.id);
    if (!rechnung) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(rechnung);
  } catch (err) {
    console.error("Fehler beim Laden der Rechnung:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};

// Rechnung löschen
export const deleteRechnung = async (req: AuthRequest, res: Response) => {
  try {
    const result = await Rechnung.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Nicht gefunden" });
    res.json({ message: "Rechnung gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};

// Rechnung aktualisieren
export const updateRechnung = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await Rechnung.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};

// Alle Rechnungen eines bestimmten Klienten abrufen
export const getRechnungenVonKlient = async (req: AuthRequest, res: Response) => {
  try {
    const { klientId } = req.params;
    const user = req.user!;
    const filter: any = { klientId };

    // Nur eigene Rechnungen sehen, außer Admin
    if (user.rolle !== "admin") {
      filter.erstelltVon = user._id;
    }

    const rechnungen = await Rechnung.find(filter).sort({ rechnungsdatum: -1 });
    res.json(rechnungen);
  } catch (err) {
    console.error("Fehler beim Laden der Rechnungen für Klient:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};