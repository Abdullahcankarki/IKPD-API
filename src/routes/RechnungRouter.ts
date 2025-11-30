import express from "express";
import {
  createRechnung,
  getRechnungen,
  getRechnung,
  deleteRechnung,
  updateRechnung,
  getRechnungenVonKlient,
  createRechnungPDF,
} from "../controller/RechnungController";
import { verifyToken } from "../types/JwtMiddleware";

const router = express.Router();

// Neue Rechnung erstellen
router.post("/", verifyToken, createRechnung);

// Alle Rechnungen abrufen
router.get("/", verifyToken, getRechnungen);

// Einzelne Rechnung abrufen
router.get("/:id", verifyToken, getRechnung);

// Rechnung aktualisieren
router.patch("/:id", verifyToken, updateRechnung);

// Rechnung löschen
router.delete("/:id", verifyToken, deleteRechnung);

// Alle Rechnungen eines bestimmten Klienten
router.get("/von-klient/:klientId", verifyToken, getRechnungenVonKlient);

// PDF einer Rechnung erstellen
router.get("/:id/pdf", verifyToken, createRechnungPDF);

export default router;