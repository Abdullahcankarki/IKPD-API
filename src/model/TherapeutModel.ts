import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ITherapeut extends Document {
  username: string;
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer?: string;
  password: string;
  rolle: 'admin' | 'therapeut';
  praxisId?: mongoose.Types.ObjectId;
  stundensatz?: number;
  anfang?: Date;
  wochenstunden?: number;
  comparePassword: (password: string) => Promise<boolean>;
}

const TherapeutSchema = new Schema<ITherapeut>(
  {
    username: { type: String, required: true, unique: true },
    vorname: { type: String, required: true },
    nachname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefonnummer: { type: String },
    password: { type: String, required: true },
    rolle: { type: String, enum: ['admin', 'therapeut'], required: true },
    praxisId: { type: Schema.Types.ObjectId, ref: 'Praxis' },
    stundensatz: { type: Number },
    anfang: { type: Date, default: Date.now },
    wochenstunden: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Passwort hashen vor dem Speichern
TherapeutSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Passwortvergleichsmethode
TherapeutSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<ITherapeut>('Therapeut', TherapeutSchema);