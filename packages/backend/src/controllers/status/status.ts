import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { ApiSuccess } from '../../utils/api';
import { fetchEnrolledCourses } from '../moodle/fetch';
import { getBaseUrl } from '../moodle/index';
import { MoodleSettings } from '../moodle/schemas/moodle.schema';

/**
 * Handles GET /api/settings/status requests and responds
 * with a JSON object containing all currently available status info.
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getStatusRequest(req: Request, res: Response, next: NextFunction) {
    try {

        // TODO: Better handling in #19
        let moodleConnectionStatus = 'Unknown';
        try {
            const courses = await fetchEnrolledCourses(getBaseUrl()) as any;
            if (courses.length) moodleConnectionStatus = 'Ok';
            else if (courses.message) moodleConnectionStatus = courses.message;
        }
        catch (error) {
            moodleConnectionStatus = error.message;
        }

        const moodleCurrentFetchInterval = await MoodleSettings.getRefreshRate();
        const moodleLastFetchTimestamp = await MoodleSettings.getLastFetch();
        const moodleNextFetchTimestamp = await MoodleSettings.getNextFetch();

        const responseObject = {
            moodleConnectionStatus,
            moodleLastFetchTimestamp,
            moodleNextFetchTimestamp,
            moodleCurrentFetchInterval,
        };

        const response = new ApiSuccess(200, responseObject);
        next(response);
    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
