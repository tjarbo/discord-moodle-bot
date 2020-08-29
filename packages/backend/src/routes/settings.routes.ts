import { Router } from 'express';
import { setRefreshRateRequest, getRefreshRateRequest } from '../controllers/refreshRate/refreshRate';
import { getCourseListRequest, setCourseRequest } from '../controllers/courseList/courseList';
import { setDiscordChannelRequest, getDiscordChannelRequest } from '../controllers/discordChannel/discordChannel';
import { addAdministratorRequest } from '../controllers/administrator';
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
settingsRoutes.get('/status', getStatusRequest);
