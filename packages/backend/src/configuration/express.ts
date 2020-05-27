import { json, urlencoded } from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { Response, Request } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { loggerMiddleware } from './logger';
import { router } from '../routes/index.routes';

export const app = express();

app.use(loggerMiddleware);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors());

// Delimit number of requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 100
});
// only apply to requests that begin with /api/
app.use('/api/', apiLimiter, router);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: any, ) => {
    res.status(404).end();
});
