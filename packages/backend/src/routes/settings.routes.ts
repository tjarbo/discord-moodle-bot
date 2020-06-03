import { Router } from 'express';
import { apiErrorHandler } from '../controllers/error/handler';
import { setRefreshRateRequest, getRefreshRateRequest } from '../controllers/refreshRate/refreshRate';
import { getCourseListRequest, setCourseRequest } from '../controllers/courseList/courseList';
export const settingsRoutes = Router();

// register routes
settingsRoutes.get('/refreshRate', getRefreshRateRequest);
settingsRoutes.put('/refreshRate', setRefreshRateRequest);
settingsRoutes.get('/courses', getCourseListRequest);
settingsRoutes.put('/courses/:id', setCourseRequest);



settingsRoutes.use(apiErrorHandler);
