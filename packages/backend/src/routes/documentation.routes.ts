import { Router } from 'express';
import swagger from 'swagger-ui-express';
import documentation from '../docs/rest-api.json';

export const docRoutes = Router();

// register routes
docRoutes.use('/docs', swagger.serve);
docRoutes.get('/docs', swagger.setup(documentation));