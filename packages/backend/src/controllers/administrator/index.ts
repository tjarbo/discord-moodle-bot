import { Request, Response, NextFunction } from 'express';
import { loggerFile } from '../../configuration/logger';
import { Administrator, administratorUsernameValidationSchema } from './administrator.schema';
import { ApiError, ApiSuccess } from '../../utils/api';
import { RegistrationToken } from '../authentication/registrationToken.schema';
import { config } from '../../configuration/environment';
import { object } from '@hapi/joi';
import { JWT } from '../authentication';

/****************************************
 *       User input validation          *
 * **************************************/
const adminAdministratorDeleteRequestSchema = object({
    username: administratorUsernameValidationSchema,
}).unknown();


/****************************************
 *          Endpoint Handlers           *
 * **************************************/

/**
 * POST /settings/administrator
 * Creates and returns a new registration token
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function adminAdministratorPostRequest(req: Request & JWT, res: Response, next: NextFunction) {

    try {

        // 1. Create a new registration token
        const registrationToken = await new RegistrationToken({ userIsDeletable: true }).save();
        if (registrationToken === null || registrationToken === undefined) throw new ApiError(500, 'Unable to create registration token');

        const responseBody = {
            token: registrationToken.key,
            origin: config.rp.origin,
            lifetime: config.registrationTokenLifetime,
        };

        loggerFile.warn(`New registration token created by "${req.token.data.username}"`);
        const response = new ApiSuccess(201, responseBody);
        next(response);

    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}

/**
 * GET /api/settings/administrator
 *
 * Responds a list of all administrators.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function adminAdministratorGetRequest(req: Request, res: Response, next: NextFunction) {

    try {
        // 1. Get administrators from database
        const administrators = await Administrator.find({});
        if (!administrators) throw new ApiError(500, 'Internal error while retrieving administrators');

        // 2. Extract relevant details
        const administratorList = administrators.map(model => {
            return {
                username: model.get('username'),
                createdAt: new Date(model.get('createdAt')).getTime(),
                deletable: model.get('deletable'),
                hasDevice: !!model.get('device'),
            };
        });

        const response = new ApiSuccess(200, administratorList);
        next(response);

    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}

/**
 * DELETE /settings/administrator/{username}
 *
 * Deletes an administrator specified by user id from the database
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function adminAdministratorDeleteRequest(req: Request & JWT, res: Response, next: NextFunction) {

    try {

        // 1. Validate user input
        const administratorDeleteRequest = adminAdministratorDeleteRequestSchema.validate(req.params);
        if (administratorDeleteRequest.error) throw new ApiError(400, administratorDeleteRequest.error.message);

        // 2. Get requested admin from database
        const administrator = await Administrator.findOne({ username: administratorDeleteRequest.value.username });
        if (administrator === null || administrator === undefined) {
            throw new ApiError(404, `Administrator ${administratorDeleteRequest.value.username} not found`);
        }

        // 3. Validate that admin is deletable and throw error if not
        if (!administrator.deletable) throw new ApiError(403, `Administrator ${administratorDeleteRequest.value.username} is not deletable`);

        try {
            // 4. Delete admin
            await administrator.deleteOne();

            loggerFile.warn(`Administrator "${administrator.username}" deleted by "${req.token.data.username}"`);
            const response = new ApiSuccess(204);
            next(response);
        } catch (error) {
            loggerFile.error(error.message);
            throw new ApiError(500, 'Failed to delete administrator or authenticator');
        }


    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
