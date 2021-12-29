import { Router } from 'express';
import { docRoutes } from './documentation.routes';
import { authRoutes } from './authentication.routes';
import { connectorsRoutes } from './connectors.routes';
import { settingsRoutes } from './settings.routes';
import { isAuth } from '../controllers/authentication';
import { manualFetchRequest } from '../controllers/moodle';
import { statusGetRequest } from '../controllers/status/status';
export const router = Router();

// register routes
router.use(docRoutes);
router.use(authRoutes);
router.use(connectorsRoutes);
router.use('/settings', settingsRoutes);
router.get('/fetch', isAuth, manualFetchRequest);
router.get('/status', isAuth, statusGetRequest);
