import { Router } from 'express';
import { setRefreshRateRequest, getRefreshRateRequest } from '../controllers/moodle/refreshRate';
import { getCourseListRequest, setCourseRequest } from '../controllers/courseList/courseList';
import { setDiscordChannelRequest, getDiscordChannelRequest } from '../controllers/discordChannel/discordChannel';
import { addAdministratorRequest, getAdministratorListRequest, deleteAdministratorRequest } from '../controllers/administrator';
import { getStatusRequest } from '../controllers/status/status';
export const settingsRoutes = Router();

// register routes
settingsRoutes.get('/refreshRate', getRefreshRateRequest);
settingsRoutes.put('/refreshRate', setRefreshRateRequest);
settingsRoutes.get('/courses', getCourseListRequest);
settingsRoutes.put('/courses/:id', setCourseRequest);
settingsRoutes.get('/discordChannel', getDiscordChannelRequest);
settingsRoutes.put('/discordChannel', setDiscordChannelRequest);
settingsRoutes.post('/administrator', addAdministratorRequest);
settingsRoutes.get('/administrator', getAdministratorListRequest);
settingsRoutes.delete('/administrator/:id', deleteAdministratorRequest);
settingsRoutes.get('/status', getStatusRequest);
