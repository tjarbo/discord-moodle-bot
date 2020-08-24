import { Response, Request } from 'express';
import { ApiResponse, ApiError } from './index';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { HttpError } from 'http-errors';

/**
 * Custom express middleware to handle any kind of responses. Called via next parameter
 * at previous middleware.
 *
 * @param {*} param
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
export const apiMiddleware = (param: any, req: Request, res: Response, next: any) => {

  let apiError;

  switch (true) {

    /**
     * param is instance of ApiResponse so that it can just
     * send as response
     */
    case param instanceof ApiResponse:
      res.status((param as ApiResponse).code).json(param);
      break;

    /**
     * param is instance of HttpError, created by some express middleware.
     * Convert HttpError to ApiError and send response
     */
    case param instanceof HttpError:
      const { status, message} = (param as HttpError);
      apiError = new ApiError(status, message);
      res.status(status).json(apiError);
      break;

    /**
     * param is an UnauthorizedError, created by express-jwt.
     * Convert Error to ApiError and send response
     */
    case (param instanceof Error && param.name === 'UnauthorizedError'):
      apiError = new ApiError(401, param.message);
      res.status(401).json(apiError);
      break;

    /**
     * The default case/type for the param object is a static Error.
     * Print stacktrace during development.
     * Send 500 - Internal Server error as response.
     */
    default:
      if (config.env === 'development') { loggerFile.debug(param.stack); }
      apiError = new ApiError(500, 'Internal server error');
      res.status(500).json(apiError);
      break;
  }

  next(param);
};
