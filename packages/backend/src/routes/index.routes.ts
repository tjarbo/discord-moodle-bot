import { Router } from 'express';
import { docRoutes } from './documentation.routes';

export const router = Router();

// register routes
router.use(docRoutes);