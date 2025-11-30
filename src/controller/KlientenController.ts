import { z } from 'zod';
import { AuthRequest } from '../types/AuthRequest';
import { Response } from 'express';
import KlientModel from '../model/KlientModel';

const klientSchema = z.object({
  name: z.string().min(1),
  geburtsdatum: z.string(), // ISO format
  adresse: z.string().optional(),
  telefonnummer: z.string().optional(),
  email: z.string().email().optional(),
  kontaktperson: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      telefonnummer: z.string().optional(),
    })
    .optional(),
  auftraggeberNamen: z.array(z.string()),
});

const berechneAlter = (geburtsdatum: Date): number => {
  const heute = new Date();
  let alter = heute.getFullYear() - geburtsdatum.getFullYear();
  const m = heute.getMonth() - geburtsdatum.getMonth();
  if (m < 0 || (m === 0 && heute.getDate() < geburtsdatum.getDate())) {
    alter--;
  }
  return alter;
};

export const createKlient = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = klientSchema.parse(req.body);

    const neuer = await KlientModel.create({
      ...parsed,
      geburtsdatum: new Date(parsed.geburtsdatum),
      praxisId: req.user?.praxisId,
      therapeutId: req.user?._id,
    });

    res.status(201).json({
      ...neuer.toObject(),
      alter: berechneAlter(neuer.geburtsdatum),
    });
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Anlegen', error: err.message });
  }
};

export const getMeineKlienten = async (req: AuthRequest, res: Response) => {
  try {
    const filter =
      req.user?.rolle === 'admin'
        ? { praxisId: req.user.praxisId }
        : { therapeutId: req.user?._id };

    const klienten = await KlientModel.find(filter);
    const result = klienten.map(k => ({
      ...k.toObject(),
      alter: berechneAlter(k.geburtsdatum),
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const getKlientById = async (req: AuthRequest, res: Response) => {
  try {
    const klient = await KlientModel.findById(req.params.id);
    if (!klient) return res.status(404).json({ message: 'Nicht gefunden' });

    if (
      req.user?.rolle !== 'admin' &&
      klient.therapeutId.toString() !== req.user?._id
    ) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    res.json({
      ...klient.toObject(),
      alter: berechneAlter(klient.geburtsdatum),
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const updateKlient = async (req: AuthRequest, res: Response) => {
  try {
    const klient = await KlientModel.findById(req.params.id);
    if (!klient) return res.status(404).json({ message: 'Nicht gefunden' });

    if (
      req.user?.rolle !== 'admin' &&
      klient.therapeutId.toString() !== req.user?._id
    ) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const parsed = klientSchema.partial().parse(req.body);

    Object.assign(klient, parsed);
    await klient.save();

    res.json({
      ...klient.toObject(),
      alter: berechneAlter(klient.geburtsdatum),
    });
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};

export const deleteKlient = async (req: AuthRequest, res: Response) => {
  try {
    const klient = await KlientModel.findById(req.params.id);
    if (!klient) return res.status(404).json({ message: 'Nicht gefunden' });

    if (
      req.user?.rolle !== 'admin' &&
      klient.therapeutId.toString() !== req.user?._id
    ) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    await klient.deleteOne();
    res.json({ message: 'Klient gelöscht' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
  }
};