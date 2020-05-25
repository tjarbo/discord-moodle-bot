import { Router } from 'express';
import { docRoutes } from './documentation.routes';
import { authRoutes } from './authentication.routes';
export const router = Router();

// register routes
router.use(docRoutes);
router.use(authRoutes);
