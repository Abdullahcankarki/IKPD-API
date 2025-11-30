
import mongoose, { Schema } from 'mongoose';

// Wir speichern Termine nicht als Referenz, sondern betten sie direkt in die Rechnung ein.
// Grund: Eine Rechnung muss auch Jahre später noch denselben Datenstand haben.
// Wenn wir stattdessen Termin-IDs referenzieren würden, könnten spätere Änderungen am Termin-Modell die Rechnung verfälschen.
// Dieses Schema speichert also eine "Momentaufnahme" der Termin-Daten für jede Rechnung.

const terminSchema = new Schema({
  datum: { type: Date, required: true },
  dauer: { type: Number, required: true },
  beschreibung: { type: String },
  therapeutName: { type: String, required: true },
  qualifikation: { type: String, required: true },
});

const praxisInfoSchema = new Schema({
  name: { type: String, required: true },
  adresse: { type: String, required: true },
  telefonnummer: { type: String },
  email: { type: String },
  iban: { type: String },
  bankname: { type: String },
  bic: { type: String },
});

const rechnungSchema = new Schema({
  monat: { type: Number, required: true },
  jahr: { type: Number, required: true },
  rechnungsdatum: { type: Date, required: true },
  rechnungsnummer: { type: String, required: true },
  umsatzsteuer: { type: Number, enum: [0, 7, 19], required: true },

  klientId: { type: Schema.Types.ObjectId, ref: 'Klient', required: true },
  klientName: { type: String, required: true },
  geburtsdatum: { type: Date, required: true },
  artDerMassnahme: { type: String, required: true },

  auftraggeberId: { type: Schema.Types.ObjectId, ref: 'Auftraggeber' },
  auftraggeberName: { type: String },
  empfaenger: { type: String, enum: ['klient', 'auftraggeber'], required: true },

  termine: [terminSchema],
  gesamtStunden: { type: Number, required: true },
  stundensatz: { type: Number, required: true },
  gesamtBetrag: { type: Number, required: true },

  praxisInfo: praxisInfoSchema,
  praxisId: { type: Schema.Types.ObjectId, ref: 'Praxis', required: true },
  erstelltVon: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Rechnung', rechnungSchema);