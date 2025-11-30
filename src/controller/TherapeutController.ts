import { Request, Response } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import TherapeutModel from '../model/TherapeutModel';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const therapeutSchema = z.object({
  username: z.string(),
  vorname: z.string(),
  nachname: z.string(),
  email: z.string().email(),
  telefonnummer: z.string().optional(),
  password: z.string().min(6),
  rolle: z.enum(['admin', 'therapeut']),
  praxisId: z.string().optional(),
  stundensatz: z.number().optional(),
  anfang: z.string().optional(),
  wochenstunden: z.number().optional(),
});

export const login = async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await TherapeutModel.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Ungültige Anmeldedaten' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Ungültige Anmeldedaten' });

    const token = jwt.sign(
      { _id: user._id, rolle: user.rolle, praxisId: user.praxisId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login fehlgeschlagen', error: err });
  }
};

export const createTherapeut = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') return res.status(403).json({ message: 'Nicht autorisiert' });

    const parsed = therapeutSchema.parse(req.body);
    const neuer = new TherapeutModel(parsed);
    await neuer.save();
    res.status(201).json({ message: 'Therapeut erstellt' });
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Erstellen', error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const therapeut = await TherapeutModel.findById(req.user?._id).select('-password');
    res.json(therapeut);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Laden', error: err.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = ['vorname', 'nachname', 'telefonnummer', 'email', 'praxisId'];
    const updates: any = {};
    for (const key of allowedFields) {
      if (req.body[key]) updates[key] = req.body[key];
    }

    const updated = await TherapeutModel.findByIdAndUpdate(req.user?._id, updates, { new: true }).select('-password');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: 'Passwort zu kurz' });

  try {
    const therapeut = await TherapeutModel.findById(req.user?._id);
    if (!therapeut) return res.status(404).json({ message: 'Nicht gefunden' });

    therapeut.password = password;
    await therapeut.save();

    res.json({ message: 'Passwort geändert' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Ändern', error: err.message });
  }
};

export const deleteTherapeut = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') return res.status(403).json({ message: 'Nicht autorisiert' });

    await TherapeutModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Therapeut gelöscht' });
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Löschen', error: err.message });
  }
};

export const getAllTherapeuten = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') return res.status(403).json({ message: 'Nicht autorisiert' });

    const therapeuten = await TherapeutModel.find().select('-password');
    res.json(therapeuten);
  } catch (err: any) {
    res.status(500).json({ message: 'Fehler beim Laden der Therapeuten', error: err.message });
  }
};

export const updateTherapeutById = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rolle !== 'admin') return res.status(403).json({ message: 'Nicht autorisiert' });

    const updated = await TherapeutModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren', error: err.message });
  }
};