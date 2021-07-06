import { NextFunction, Request, Response } from 'express';
import { loggerFile } from '../../configuration/logger';
import { ApiSuccess } from '../../utils/api';
import { connectorService } from './service';

/****************************************
 *       User input validation          *
 * **************************************/




/****************************************
 *          Endpoint Handlers           *
 * **************************************/

/**
 * GET /api/connectors
 *
 * Responds a list of all connectors.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export function connectorsGetRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    const response = new ApiSuccess(200, connectorService.connectors);
    next(response);

  } catch (err) {
    loggerFile.error(err.message);
    next(err);
  }

}
