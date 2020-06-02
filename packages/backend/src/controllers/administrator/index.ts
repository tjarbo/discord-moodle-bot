import { ApiError } from '../error/api.class';
import { Request, Response, NextFunction } from 'express';
import { object, string } from '@hapi/joi';
import { loggerFile } from '../../configuration/logger';
import { Administrator } from './administrator.schema';

const administratorRequestSchema = object({
    username: string().required().regex(/[a-z]+#[0-9]+/),
    userid: string().required(),
});

/**
 * Handles POST /api/settings/administrator requests
 * and creates a new Administrator if possible
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function addAdministratorRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const administratorRequest = administratorRequestSchema.validate(req.body);
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
        res.status(201).end();

    } catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
