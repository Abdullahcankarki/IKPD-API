import express from 'express';
import {
  createPraxis,
  getAllPraxen,
  getMeinePraxen,
  deletePraxis,
  updatePraxis
} from '../controller/PraxisController';
import { verifyToken } from '../types/JwtMiddleware';

const router = express.Router();

// Auth-Middleware für alle Praxis-Routen
router.use(verifyToken);

// Neue Praxis anlegen – nur für Admins
router.post('/', createPraxis);

// Alle Praxen abrufen – nur für Admins
router.get('/', getAllPraxen);

// Eigene Praxen für Therapeut
router.get('/meine', getMeinePraxen);

// Praxis löschen – nur für Admins
router.delete('/:id', deletePraxis);

// Praxis aktualisieren – nur für Admins
router.put('/:id', updatePraxis);

export default router;