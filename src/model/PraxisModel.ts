

import mongoose, { Schema, Document } from 'mongoose';

export interface IPraxis extends Document {
  name: string;
  adresse: string;
  telefonnummer?: string;
  email?: string;
  therapeuten?: {
    _id: mongoose.Types.ObjectId;
    vorname: string;
    nachname: string;
  }[];
  iban?: string;
  bankname?: string;
  bic?: string;
}

const PraxisSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    adresse: { type: String, required: true },
    telefonnummer: { type: String },
    email: { type: String },
    therapeuten: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Therapeut'},
        vorname: { type: String},
        nachname: { type: String},
      },
    ],
    iban: { type: String},
    bankname: { type: String},
    bic: { type: String}
  },
  { timestamps: true }
);

export default mongoose.model<IPraxis>('Praxis', PraxisSchema);