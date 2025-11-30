import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './AuthRequest';
import { LoginPayload } from '../Resources';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token fehlt oder ungültig' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as LoginPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token ungültig oder abgelaufen' });
  }
};