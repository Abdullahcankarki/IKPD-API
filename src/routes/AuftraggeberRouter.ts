import express from 'express';
import {
  createAuftraggeber,
  getAlleAuftraggeber,
  getAuftraggeberById,
  updateAuftraggeber,
  deleteAuftraggeber,
} from '../controller/AuftraggeberController';
import { verifyToken } from '../types/JwtMiddleware';

const router = express.Router();

router.use(verifyToken);

router.post('/', createAuftraggeber);
router.get('/', getAlleAuftraggeber);
router.get('/:id', getAuftraggeberById);
router.put('/:id', updateAuftraggeber);
router.delete('/:id', deleteAuftraggeber);

export default router;