import { z } from 'zod';
import { AuthRequest } from '../types/AuthRequest';
import { Response } from 'express';
import TerminModel from '../model/TerminModel';
import ThreapeutModel from '../model/TherapeutModel';
import KlientModel from '../model/KlientModel';
import { Types } from 'mongoose';

const terminSchema = z.object({
  datum: z.string().datetime(),
  dauer: z.number().min(1),
  beschreibung: z.string().optional(),
  status: z.enum(['geplant', 'abgeschlossen', 'abgesagt']),
  klientId: z.string(),
  therapeutId: z.string().optional(), // wird ggf. aus Token ermittelt
});

export const createTermin = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = terminSchema.parse(req.body);

    const klient = await KlientModel.findById(parsed.klientId);
    if (!klient) return res.status(404).json({ message: 'Klient nicht gefunden' });

    const istAdmin = req.user?.rolle === 'admin';
    const therapeutId = istAdmin && parsed.therapeutId ? parsed.therapeutId : req.user?._id;

    const therapeut = await ThreapeutModel.findById(therapeutId);
    if (!therapeut) return res.status(404).json({ message: 'Therapeut nicht gefunden' });

    const neuerTermin = await TerminModel.create({
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
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
  }
};

export const getMeineTermine = async (req: AuthRequest, res: Response) => {
  try {
    const termine = await TerminModel.find({
      therapeutId: req.user?._id,
    }).sort({ datum: 1 });
    res.json(termine);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const getPraxisTermine = async (req: AuthRequest, res: Response) => {
  if (req.user?.rolle !== 'admin') return res.status(403).json({ message: 'Nicht autorisiert' });
  try {
    const termine = await TerminModel.find({
      praxisId: req.user?.praxisId,
    }).sort({ datum: 1 });
    res.json(termine);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const getTerminById = async (req: AuthRequest, res: Response) => {
  try {
    const termin = await TerminModel.findById(req.params.id);
    if (!termin) return res.status(404).json({ message: 'Nicht gefunden' });

    const istAdmin = req.user?.rolle === 'admin';
    const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
    if (!istAdmin && !istEigener)
      return res.status(403).json({ message: 'Nicht autorisiert' });

    res.json(termin);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const updateTermin = async (req: AuthRequest, res: Response) => {
  try {
    const termin = await TerminModel.findById(req.params.id);
    if (!termin) return res.status(404).json({ message: 'Nicht gefunden' });

    const istAdmin = req.user?.rolle === 'admin';
    const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
    if (!istAdmin && !istEigener)
      return res.status(403).json({ message: 'Nicht autorisiert' });

    const parsed = terminSchema.partial().parse(req.body);

    if (parsed.therapeutId && istAdmin) {
      const therapeut = await ThreapeutModel.findById(parsed.therapeutId);
      if (!therapeut) return res.status(404).json({ message: 'Therapeut nicht gefunden' });
      termin.therapeutId  = therapeut._id as Types.ObjectId;
      termin.therapeutName = therapeut.vorname + " " + therapeut.nachname;
    }

    if (parsed.klientId) {
      const klient = await KlientModel.findById(parsed.klientId);
      if (!klient) return res.status(404).json({ message: 'Klient nicht gefunden' });
      termin.klientId = klient._id as Types.ObjectId;
      termin.klientName = klient.name;
    }

    Object.assign(termin, parsed);
    await termin.save();

    res.json(termin);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};

export const deleteTermin = async (req: AuthRequest, res: Response) => {
  try {
    const termin = await TerminModel.findById(req.params.id);
    if (!termin) return res.status(404).json({ message: 'Nicht gefunden' });

    const istAdmin = req.user?.rolle === 'admin';
    const istEigener = termin.therapeutId.toString() === req.user?._id.toString();
    if (!istAdmin && !istEigener)
      return res.status(403).json({ message: 'Nicht autorisiert' });

    await termin.deleteOne();
    res.json({ message: 'Termin gelöscht' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
  }
};
