import { ApiError } from './api.class';
import { Response, Request, NextFunction } from 'express';


/**
 * Error handler
 *
 * @export
 * @param {ErrorHandler} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function apiErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  let statusCode: number;
  let message: string;

  switch (err.name) {
    case 'UnauthorizedError':
      statusCode = 401;
      message = 'Invalid token';
      break;

    default:
      statusCode = (err as ApiError).statusCode || 500;
      message = err.message;
      break;
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });

}
