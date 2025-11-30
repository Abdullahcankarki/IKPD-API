import { Request } from 'express';
import { LoginPayload } from '../Resources';

export interface AuthRequest extends Request {
  user?: LoginPayload;
}