import mongoose, { Schema, Document } from 'mongoose';

export interface ITermin extends Document {
  datum: Date;
  dauer: number;
  beschreibung?: string;
  status: 'geplant' | 'abgeschlossen' | 'abgesagt';
  klientId: mongoose.Types.ObjectId;
  klientName: string;
  therapeutId: mongoose.Types.ObjectId;
  therapeutName: string;
  praxisId: mongoose.Types.ObjectId;
}

const TerminSchema = new Schema<ITermin>(
  {
    datum: { type: Date, required: true },
    dauer: { type: Number, required: true },
    beschreibung: { type: String },
    status: {
      type: String,
      enum: ['geplant', 'abgeschlossen', 'abgesagt'],
      default: 'geplant',
    },
    klientId: { type: Schema.Types.ObjectId, ref: 'Klient', required: true },
    klientName: { type: String, required: true },
    therapeutId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapeutName: { type: String, required: true },
    praxisId: { type: Schema.Types.ObjectId, ref: 'Praxis', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITermin>('Termin', TerminSchema);