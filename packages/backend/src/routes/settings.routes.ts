import { Router } from 'express';
import { apiErrorHandler } from '../controllers/error/handler';
import { setRefreshRateRequest, getRefreshRateRequest } from '../controllers/refreshRate/refreshRate';
export const settingsRoutes = Router();

// register routes
settingsRoutes.get('/refreshRate', getRefreshRateRequest);
settingsRoutes.put('/reFreshRate', setRefreshRateRequest);



settingsRoutes.use(apiErrorHandler);
