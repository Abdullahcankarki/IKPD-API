import { z } from 'zod';
import { AuthRequest } from '../types/AuthRequest';
import { Response } from 'express';
import AuftraggeberModel from '../model/AuftraggeberModel';

const auftraggeberSchema = z.object({
  name: z.string().min(1),
  institution: z.string().min(1),
  funktion: z.string().min(1),
  adresse: z.string().min(1),
  telefonnummer: z.string().optional(),
  email: z.string().email(),
});

export const createAuftraggeber = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = auftraggeberSchema.parse(req.body);

    const existing = await AuftraggeberModel.findOne({
      email: parsed.email,
      praxisId: req.user?.praxisId,
    });
    if (existing) {
      return res.status(409).json({ message: 'Auftraggeber mit dieser E-Mail existiert bereits.' });
    }

    const neuer = await AuftraggeberModel.create({
      ...parsed,
      praxisId: req.user?.praxisId,
    });

    res.status(201).json(neuer);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
  }
};

export const getAlleAuftraggeber = async (req: AuthRequest, res: Response) => {
  try {
    const auftraggeber = await AuftraggeberModel.find({ praxisId: req.user?.praxisId });
    res.json(auftraggeber);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const getAuftraggeberById = async (req: AuthRequest, res: Response) => {
  try {
    const ag = await AuftraggeberModel.findById(req.params.id);
    if (!ag) return res.status(404).json({ message: 'Nicht gefunden' });

    if (ag.praxisId.toString() !== req.user?.praxisId) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    res.json(ag);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const updateAuftraggeber = async (req: AuthRequest, res: Response) => {
  try {
    const ag = await AuftraggeberModel.findById(req.params.id);
    if (!ag) return res.status(404).json({ message: 'Nicht gefunden' });

    if (ag.praxisId.toString() !== req.user?.praxisId) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const parsed = auftraggeberSchema.partial().parse(req.body);
    Object.assign(ag, parsed);
    await ag.save();

    res.json(ag);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};

export const deleteAuftraggeber = async (req: AuthRequest, res: Response) => {
  try {
    const ag = await AuftraggeberModel.findById(req.params.id);
    if (!ag) return res.status(404).json({ message: 'Nicht gefunden' });

    if (ag.praxisId.toString() !== req.user?.praxisId) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    await ag.deleteOne();
    res.json({ message: 'Auftraggeber gelöscht' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
  }
};