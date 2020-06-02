import { Router } from 'express';
import { docRoutes } from './documentation.routes';
import { authRoutes } from './authentication.routes';
import { settingsRoutes } from './settings.routes';
import { isAuth } from '../controllers/authentication/auth';
export const router = Router();

// register routes
router.use(docRoutes);
router.use(authRoutes);
router.use('/settings', isAuth, settingsRoutes);
