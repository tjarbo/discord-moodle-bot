import { Request, Response, NextFunction } from 'express';
import { object, string } from '@hapi/joi';
import { loggerFile } from '../../configuration/logger';
import { Administrator } from './administrator.schema';
import { ApiError, ApiSuccess } from '../../utils/api';

const addAdministratorRequestSchema = object({
    username: string().required().regex(/^[\w\s]+#\d{4}$/),
    userid: string().required().regex(/^\d{18}$/),
});

const deleteAdministratorRequestSchema = object({
    params: object({
        id: string().required().regex(/^\d{18}$/)
    }).required(),
}).unknown(true);

/**
 * Handles POST /api/settings/administrator requests
 * and creates a new Administrator if possible
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function addAdministratorRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const administratorRequest = addAdministratorRequestSchema.validate(req.body);
        if (administratorRequest.error) throw new ApiError(400, administratorRequest.error.message);

        // check if administrator exists at the database
        const administrator = await Administrator.findOne({ $or: [
            { userName: administratorRequest.value.username },
            { userId: administratorRequest.value.userid }
        ] });

        // throw error, if admin name or id is already being used
        if (administrator) {
            if (administratorRequest.value.username === administrator.userName)
                throw new ApiError(400, `Administrator ${administrator.userName} already exists`);
            if (administratorRequest.value.userid === administrator.userId)
                throw new ApiError(400, `Administrator with ID ${administrator.userId} already exists`);
        }

        // create new administrator
        const adminObj = {
            userId: administratorRequest.value.userid,
            userName: administratorRequest.value.username,
        };

        await new Administrator(adminObj).save();

        const response = new ApiSuccess(201);
        next(response);

    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}

/**
 * Handles GET /api/settings/administrator requests
 * and responds with a list of all administrators.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getAdministratorListRequest(req: Request, res: Response, next: NextFunction) {

    try {
        // Get administrators from database
        const administrators = await Administrator.find({});
        if (!administrators) throw new ApiError(503, 'Internal error while retrieving administrators');

        // Extract relevant details
        const administratorList = administrators.map(model => {
            return {
                userName: model.get('userName'),
                userId: model.get('userId'),
                createdAt: new Date(model.get('createdAt')).getTime(),
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
 * Handles DELETE /api/settings/administrator requests
 * and deletes an administrator specified by user id from the database
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function deleteAdministratorRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const administratorRequest = deleteAdministratorRequestSchema.validate(req);
        if (administratorRequest.error) throw new ApiError(400, administratorRequest.error.message);

        // Delete administrator from database
        const administrator = await Administrator.findOneAndDelete({
            userId: administratorRequest.value.params.id
        });

        // Throw error, if admin user id is not in database
        if (!administrator) {
            throw new ApiError(400, `Administrator with id ${administratorRequest.value.params.id} not found in database`);
        }

        const response = new ApiSuccess(200);
        next(response);

    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
