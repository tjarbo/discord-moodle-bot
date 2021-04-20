import { Router } from 'express';
import { authAttestationGetRequest, authAttestationPostRequest, authAssertionGetRequest, authAssertionPostRequest, authVerify, isAuth } from '../controllers/authentication';
export const authRoutes = Router();

// register routes
authRoutes.get('/webauthn/register', authAttestationGetRequest);
authRoutes.post('/webauthn/register', authAttestationPostRequest);
authRoutes.get('/webauthn/login', authAssertionGetRequest);
authRoutes.post('/webauthn/login', authAssertionPostRequest);
authRoutes.use('/verify', isAuth, authVerify);
