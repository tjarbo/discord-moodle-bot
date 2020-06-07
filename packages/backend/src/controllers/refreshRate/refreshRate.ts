import { RefreshRate } from './refreshRate.schema';
import { config } from '../../configuration/environment';
import { ApiError } from '../error/api.class';
import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { object, number } from '@hapi/joi';

/**
 * Writes the refresh rate into the database.
 * Uses the default config value if no value is given.
 * Creates a new document if it doesn't exist before.
 * @param intervall Fetch intervall in minutes
 * @export
 */
export async function setRefreshRate(intervall: number = config.moodle.fetchInterval):Promise<void>{
    await RefreshRate.findOneAndUpdate({},{$set: {milliseconds: intervall}},{upsert: true});
}

/**
 * Returns the refresh rate value from the database.
 * Creates a new document with the config value if it doesn't exist before.
 * @export
 * @returns {Promise<number>} A promise to the refresh rate loaded from the database (number).
 */
export async function getRefreshRate():Promise<number>{
    const result = await RefreshRate.findOne();
    if (!result) await setRefreshRate();
    return result ? result.milliseconds : config.moodle.fetchInterval;
}

/**
 * Handles GET /api/settings/refreshRate requests and responds
 * with the current refreshRate in milliseconds (as JSON Object).
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getRefreshRateRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const refreshRate = await getRefreshRate();
        if (!refreshRate) throw new ApiError(503, 'Internal error while retrieving refresh rate');
        res.status(200).json({refreshRate});

    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }

// Schema for validating api input
const refreshRateRequestSchema = object({
    refreshRate: number().greater(5000).less(2147483647).required()
});

/**
 * Handles PUT /api/settings/refreshRate requests.
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
        await setRefreshRate(refreshRate);
        res.status(200).end();

    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }
