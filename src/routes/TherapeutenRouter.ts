import express from 'express';
import {
  login,
  createTherapeut,
  getMe,
  updateMe,
  changePassword,
  deleteTherapeut,
  getAllTherapeuten,
  updateTherapeutById
} from '../controller/TherapeutController';

const router = express.Router();

// Auth-Middleware für alle geschützten Routen außer Login
router.use((req, res, next) => {
  if (req.path === '/login') return next();
  return require('../types/JwtMiddleware').verifyToken(req, res, next);
});

// Login (öffentlich)
router.post('/login', login);

// Therapeut erstellen – nur Admin
router.post('/', createTherapeut);
router.get('/all', getAllTherapeuten);

// Eigene Daten abrufen
router.get('/me', getMe);

// Eigene Daten aktualisieren
router.put('/me', updateMe);

// Passwort ändern
router.put('/me/password', changePassword);

// Therapeut löschen – nur Admin
router.delete('/:id', deleteTherapeut);
router.put('/:id', updateTherapeutById);

export default router;