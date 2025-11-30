// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import praxisRouter from './routes/PraxisRouter';
import therapeutRouter from './routes/TherapeutenRouter';
import klientRouter from './routes/KlientenRouter';
import auftraggeberRouter from './routes/AuftraggeberRouter';
import terminRouter from './routes/TerminRouter';
import rechnungRouter from './routes/RechnungRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());

// API-Routen
app.use('/api/praxen', praxisRouter);
app.use('/api/therapeut', therapeutRouter);
app.use('/api/klienten', klientRouter);
app.use('/api/auftraggeber', auftraggeberRouter);
app.use('/api/termine', terminRouter);
app.use('/api/rechnungen', rechnungRouter);

// Test route
app.get('/', (_req, res) => {
  res.send('Psychotherapie-Backend läuft 🚀');
});

// MongoDB-Verbindung
mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ MongoDB verbunden');
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Fehler bei MongoDB-Verbindung:', err);
  });