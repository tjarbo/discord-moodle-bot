import { Router } from 'express';
import { connectorsGetRequest } from '../controllers/connectors/handlers';
export const connectorsRoutes = Router();

// register routes
connectorsRoutes.get('/connectors', connectorsGetRequest);
connectorsRoutes.post('/connectors');
connectorsRoutes.post('/connectors/:id');
connectorsRoutes.patch('/connectors/:id');
connectorsRoutes.delete('/connectors/:id');
connectorsRoutes.get('/connectors/:id/logs');
