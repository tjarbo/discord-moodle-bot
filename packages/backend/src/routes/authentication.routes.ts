import { Router } from 'express';
import { authTokenRequest, authLoginRequest, isAuth } from '../controllers/authentication/auth';
import { apiErrorHandler } from '../controllers/error/handler';
export const authRoutes = Router();

// register routes
authRoutes.post('/token', authTokenRequest);
authRoutes.post('/login', authLoginRequest);
authRoutes.use(isAuth);
// register all other routes between here ...

// and here
authRoutes.use(apiErrorHandler);
