import mongoose, { Schema, Document } from 'mongoose';

interface IKlient extends Document {
  name: string;
  geburtsdatum: Date;
  adresse?: string;
  telefonnummer?: string;
  email?: string;
  kontaktperson?: {
    name?: string;
    email?: string;
    telefonnummer?: string;
  };
  auftraggeberNamen: mongoose.Types.ObjectId[];
  praxisId: mongoose.Types.ObjectId;
  therapeutId: mongoose.Types.ObjectId;
}

const KontaktpersonSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    telefonnummer: { type: String },
  },
  { _id: false }
);

const KlientSchema = new Schema<IKlient>(
  {
    name: { type: String, required: true },
    geburtsdatum: { type: Date, required: true },
    adresse: { type: String },
    telefonnummer: { type: String },
    email: { type: String },
    kontaktperson: { type: KontaktpersonSchema },
    auftraggeberNamen: [{ type: mongoose.Types.ObjectId }],
    praxisId: { type: Schema.Types.ObjectId, ref: 'Praxis', required: true },
    therapeutId: { type: Schema.Types.ObjectId, ref: 'Therapeut', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IKlient>('Klient', KlientSchema);