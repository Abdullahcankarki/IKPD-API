import mongoose, { Schema, Document } from 'mongoose';

interface IAuftraggeber extends Document {
  name: string;
  institution: string;
  funktion: string;
  adresse: string;
  telefonnummer?: string;
  email: string;
  praxisId: mongoose.Types.ObjectId;
}

const AuftraggeberSchema = new Schema<IAuftraggeber>(
  {
    name: { type: String, required: true },
    institution: { type: String, required: true },
    funktion: { type: String, required: true },
    adresse: { type: String, required: true },
    telefonnummer: { type: String },
    email: { type: String, required: true },
    praxisId: { type: Schema.Types.ObjectId, ref: 'Praxis', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAuftraggeber>('Auftraggeber', AuftraggeberSchema);