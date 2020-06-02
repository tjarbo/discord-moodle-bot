import { Router } from 'express';
import { authTokenRequest, authLoginRequest, authVerify, isAuth } from '../controllers/authentication/auth';
import { apiErrorHandler } from '../controllers/error/handler';
export const authRoutes = Router();

// register routes
authRoutes.post('/token', authTokenRequest);
authRoutes.post('/login', authLoginRequest);
authRoutes.use(isAuth);

authRoutes.use('/verify', authVerify);
authRoutes.use(apiErrorHandler);
