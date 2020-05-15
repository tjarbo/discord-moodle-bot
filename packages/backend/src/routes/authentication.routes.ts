import { Router } from 'express';
import { authRequestToken } from '../controllers/authentication/auth';
export const authRoutes = Router();

// register routes
authRoutes.post('/login/request-token', authRequestToken);