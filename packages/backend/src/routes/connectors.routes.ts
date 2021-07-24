import { Router } from 'express';
import { connectorsGetRequest, connectorsIdDeleteRequest, connectorsIdPatchRequest } from '../controllers/connectors/handlers';
export const connectorsRoutes = Router();

// register routes
connectorsRoutes.get('/connectors', connectorsGetRequest);
connectorsRoutes.post('/connectors');
connectorsRoutes.patch('/connectors/:id', connectorsIdPatchRequest);
connectorsRoutes.delete('/connectors/:id', connectorsIdDeleteRequest);
connectorsRoutes.get('/connectors/:id/logs');
