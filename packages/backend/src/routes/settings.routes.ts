import { Router } from 'express';
import { setRefreshRateRequest, getRefreshRateRequest } from '../controllers/moodle/refreshRate';
import { getCourseListRequest, setCourseRequest } from '../controllers/courseList/courseList';
import { adminAdministratorPostRequest, adminAdministratorGetRequest,adminAdministratorDeleteRequest } from '../controllers/administrator';
import { isAuth } from '../controllers/authentication';
export const settingsRoutes = Router();

// register routes
settingsRoutes.use(isAuth);
settingsRoutes.get('/refreshRate', getRefreshRateRequest);
settingsRoutes.put('/refreshRate', setRefreshRateRequest);
settingsRoutes.get('/courses', getCourseListRequest);
settingsRoutes.put('/courses/:id', setCourseRequest);
settingsRoutes.post('/administrators', adminAdministratorPostRequest);
settingsRoutes.get('/administrators', adminAdministratorGetRequest);
settingsRoutes.delete('/administrators/:username', adminAdministratorDeleteRequest);
