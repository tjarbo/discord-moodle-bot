import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { object, number } from '@hapi/joi';
import { ApiSuccess, ApiError } from '../../utils/api';
import { MoodleSettings } from './schemas/moodle.schema';

/**
 * Handles GET /api/settings/refreshRate requests and responds
 * with the current refreshRate in milliseconds (as JSON Object).
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getRefreshRateRequest(req: Request, res: Response, next: NextFunction) {

  try {
    const refreshRate = await MoodleSettings.getRefreshRate();
    if (!refreshRate) throw new ApiError(503, 'Internal error while retrieving refresh rate');

    const response = new ApiSuccess(200, { refreshRate });
    next(response);
  } catch (err) {
    loggerFile.error(err.message);
    next(err);
  }
}

// Schema for validating api input
const refreshRateRequestSchema = object({
  refreshRate: number().greater(5000).less(2147483647).required(),
});

/**
 * Handles PUT /api/settings/refreshRate requests.
 * Writes the refresh rate into the database.
 * @param req Request: Contains refresh rate in milliseconds
 * @param res Response
 * @param next NextFunction
 */
export async function setRefreshRateRequest(req: Request, res: Response, next: NextFunction) {

  try {
    // Input checking and parsing
    const request = refreshRateRequestSchema.validate(req.body);
    if (request.error) throw new ApiError(400, request.error.message);
    const refreshRate = request.value.refreshRate;

    // Method call and exit
    await MoodleSettings.findOneAndUpdate({}, { $set: { refreshRate } });

    const response = new ApiSuccess();
    next(response);
  } catch (err) {
    loggerFile.error(err.message);
    next(err);
  }
}
