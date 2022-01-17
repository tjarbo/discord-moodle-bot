import { json, urlencoded } from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { Response, Request, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { loggerMiddleware } from './logger';
import { router } from '../routes/index.routes';
import { ApiError, apiMiddleware } from '../utils/api';
import path from 'path';

const uiDistDir = '../../../../frontend/dist';

export const app = express();

app.use(loggerMiddleware);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors());

// makes every file in uiDistFolder accessible
app.use(express.static(path.join(__dirname, uiDistDir)));

// open /index.html if no path is specified.
app.use(/^((?!(api)).)*/, (_, res) => { res.sendFile(path.join(__dirname, uiDistDir + '/index.html')); });

// Delimit number of requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

// only apply to requests that begin with /api/
app.use('/api/', apiLimiter, router);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction ) => {
  const apiError = new ApiError(404, 'Not found');
  return next(apiError);
});

// handle any kind of response from ApiResponse instances to Error objects
app.use(apiMiddleware);
