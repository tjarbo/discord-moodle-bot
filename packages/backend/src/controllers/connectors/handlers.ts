import { any, array, boolean, number, object, string } from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import { loggerFile } from '../../configuration/logger';
import { ApiError, ApiSuccess } from '../../utils/api';
import { connectorService } from './service';

/****************************************
 *       User input validation          *
 * **************************************/
const connectorsIdSchema = object({
  id: string().hex().length(24).required(),
});

const connectorsIdPatchRequestSchema = object({
  active: boolean(),
  courses: array().items(number()),
  default: boolean(),
  name: string().max(64),
  socket: object().unknown(),
}).required();


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

export async function connectorsIdPatchRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Validate given id
    const connectorIdValidation = connectorsIdSchema.validate(req.params);
    if (connectorIdValidation.error) throw new ApiError(400, connectorIdValidation.error.message);

    // 2. Validate request body
    const connectorsIdPatchRequestValidation = connectorsIdPatchRequestSchema.validate(req.body);
    if (connectorsIdPatchRequestValidation.error) throw new ApiError(400, connectorsIdPatchRequestValidation.error.message);

    // 3. Update connector
    const updatedConnector = await connectorService.update(connectorIdValidation.value.id, connectorsIdPatchRequestValidation.value);

    // 4. Send response
    const response = new ApiSuccess(200, updatedConnector);
    next(response);
  } catch (error) {
    loggerFile.error(error.message);
    next(error);
  }
}
