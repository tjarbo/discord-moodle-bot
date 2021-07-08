import { Router } from 'express';
import { connectorsGetRequest, connectorsIdPatchRequest } from '../controllers/connectors/handlers';
export const connectorsRoutes = Router();

// register routes
connectorsRoutes.get('/connectors', connectorsGetRequest);
connectorsRoutes.post('/connectors');
connectorsRoutes.patch('/connectors/:id', connectorsIdPatchRequest);
connectorsRoutes.delete('/connectors/:id');
connectorsRoutes.get('/connectors/:id/logs');
