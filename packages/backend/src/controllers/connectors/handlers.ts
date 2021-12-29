import { array, boolean, number, object, string } from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';
import { loggerFile } from '../../configuration/logger';
import { ApiError, ApiSuccess } from '../../utils/api';
import { JWT } from '../authentication';
import { ConnectorTypeValues } from './plugins';
import { connectorService } from './service';

/****************************************
 *       User input validation          *
 * **************************************/
const connectorsIdSchema = object({
  id: string().hex().length(24).required(),
});

const connectorsPostRequestSchema = object({
  name: string().max(64).required(),
  type: string().required().valid(...ConnectorTypeValues),
  socket: object().unknown().required(),
}).required();

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

/**
 * POST /api/connectors
 *
 * Adds a new connector with connectorService
 * @param {Request} req Request
 * @param {Response} res Response
 * @param {NextFunction} next NextFunction
 */
export async function connectorsPostRequest(req: Request & JWT, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Validate body - except req.body.socket!!
    const connectorsPostRequestValidation = connectorsPostRequestSchema.validate(req.body);
    if (connectorsPostRequestValidation.error) throw new ApiError(400, connectorsPostRequestValidation.error.message);

    // 2. Create connector
    const { name, type, socket } = connectorsPostRequestValidation.value;
    const connector = await connectorService.create(name, type, socket);

    // 3. Send response
    loggerFile.info(`New connector "${connector.name}" (${connector._id}) created by "${req.token.data.username}"`);
    const response = new ApiSuccess(200, connector);
    next(response);
  } catch (err) {
    loggerFile.error(err.message);
    next(err);
  }
}


/**
 * PATCH /api/connectors/:id
 * * Id of connector as path parameter required!
 *
 * Updates whitelisted attributes of a given connector and its database document
 * @export
 * @param {Request} req Request
 * @param {Response} res Response
 * @param {NextFunction} next NextFunction
 * @return {Promise<void>} Promise
 */
export async function connectorsIdPatchRequest(req: Request & JWT, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Validate given id
    const connectorsIdValidation = connectorsIdSchema.validate(req.params);
    if (connectorsIdValidation.error) throw new ApiError(400, connectorsIdValidation.error.message);

    // 2. Validate request body - except req.body.socket!!
    const connectorsIdPatchRequestValidation = connectorsIdPatchRequestSchema.validate(req.body);
    if (connectorsIdPatchRequestValidation.error) throw new ApiError(400, connectorsIdPatchRequestValidation.error.message);

    // 3. Update connector
    const updatedConnector = await connectorService.update(connectorsIdValidation.value.id, connectorsIdPatchRequestValidation.value);

    // 4. Send response
    loggerFile.info(`Connector "${updatedConnector.name}" (${updatedConnector._id}) updated by "${req.token.data.username}"`);
    const response = new ApiSuccess(200, updatedConnector);
    next(response);
  } catch (error) {
    loggerFile.error(error.message);
    next(error);
  }
}

/**
 * DELETE /api/connectors/:id
 * Removes connector
 *
 * @export
 * @param {Request} req Request
 * @param {Response} res Response
 * @param {NextFunction} next NextFunction
 * @return {*}  {Promise<void>}
 */
export async function connectorsIdDeleteRequest(req: Request & JWT, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Validate given id
    const connectorsIdValidation = connectorsIdSchema.validate(req.params);
    if (connectorsIdValidation.error) throw new ApiError(400, connectorsIdValidation.error.message);

    // 2. Delete connector
    await connectorService.delete(connectorsIdValidation.value.id);

    // 3. Send response
    loggerFile.warn(`Connector ${connectorsIdValidation.value.id} deleted by "${req.token.data.username}"`);
    const response = new ApiSuccess(200);
    next(response);
  } catch (error) {
    loggerFile.error(error.message);
    next(error);
  }
}
