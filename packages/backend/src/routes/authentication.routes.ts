import { Router, Request, Response, NextFunction, Errback } from 'express';
import { authRequestToken, authLogin, isAuth } from '../controllers/authentication/auth';
export const authRoutes = Router();

// register routes
authRoutes.post('/token', authRequestToken);
authRoutes.post('/login', authLogin);
authRoutes.use(isAuth);
// register all other routes between here ...

// and here
authRoutes.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  } else {
    next(err);
  }
});