import express from 'express';
import {
  createKlient,
  getMeineKlienten,
  getKlientById,
  updateKlient,
  deleteKlient,
} from '../controller/KlientenController';
import { verifyToken } from '../types/JwtMiddleware';

const router = express.Router();

// Alle Routen geschützt
router.use(verifyToken);

// Klienten-Endpunkte
router.post('/', createKlient);
router.get('/meine', getMeineKlienten);
router.get('/:id', getKlientById);
router.put('/:id', updateKlient);
router.delete('/:id', deleteKlient);

export default router;