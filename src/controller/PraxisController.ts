import { Request, Response } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import PraxisModel from '../model/PraxisModel';
import { z } from 'zod';

// Zod-Schema zur Validierung von Praxiseingaben
const praxisSchema = z.object({
  name: z.string().min(1),
  adresse: z.string().min(1),
  telefonnummer: z.string().optional(),
  email: z.string().email().optional(),
  therapeuten: z.array(
    z.object({
      _id: z.string(),
      vorname: z.string(),
      nachname: z.string(),
    })
  ).optional(),
});

export const createPraxis = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const parsed = praxisSchema.parse(req.body);
    const neuePraxis = await PraxisModel.create(parsed);
    res.status(201).json(neuePraxis);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Erstellen', error: err.message });
  }
};

export const getAllPraxen = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const praxen = await PraxisModel.find();
    res.json(praxen);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const getMeinePraxen = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'therapeut') {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const praxen = await PraxisModel.find({ 'therapeuten._id': req.user._id });
    res.json(praxen);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Abrufen', error: err.message });
  }
};

export const deletePraxis = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    await PraxisModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Praxis gelöscht' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
  }
};

export const updatePraxis = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const parsed = praxisSchema.parse(req.body);
    const aktualisiertePraxis = await PraxisModel.findByIdAndUpdate(req.params.id, parsed, { new: true });

    if (!aktualisiertePraxis) {
      return res.status(404).json({ message: 'Praxis nicht gefunden' });
    }

    res.json(aktualisiertePraxis);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};