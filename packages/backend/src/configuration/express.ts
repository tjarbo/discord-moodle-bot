import {json, urlencoded} from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import methodOverride from 'method-override';

import { loggerMiddleware } from './logger';

export const app = express();

app.use(loggerMiddleware);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors());