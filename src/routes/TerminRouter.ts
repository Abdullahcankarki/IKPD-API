import express from 'express';
import {
  createTermin,
  getMeineTermine,
  getPraxisTermine,
  getTerminById,
  updateTermin,
  deleteTermin,
} from '../controller/TerminController';
import { verifyToken } from '../types/JwtMiddleware';

const router = express.Router();

router.use(verifyToken);

router.post('/', createTermin);
router.get('/meine', getMeineTermine);
router.get('/praxis', getPraxisTermine);
router.get('/:id', getTerminById);
router.put('/:id', updateTermin);
router.delete('/:id', deleteTermin);

export default router;