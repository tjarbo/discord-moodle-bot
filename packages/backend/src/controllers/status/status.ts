import { getRefreshRate } from '../refreshRate/refreshRate';
import { config } from '../../configuration/environment';
import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { ApiSuccess, ApiError } from '../../utils/api';
import { fetchEnrolledCourses } from '../moodle/fetch';
import { getBaseUrl, getLastFetch } from '../moodle/index';
import { client } from '../../configuration/discord';
import { getDiscordChannel } from '../discordChannel/discordChannel';

/**
 * Handles GET /api/settings/status requests and responds
 * with a JSON object containing all currently available status info.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getStatusRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const moodleCurrentFetchInterval = await getRefreshRate() || 'Error';

        let moodleConnectionStatus = '';
        try {
          const courses = await fetchEnrolledCourses(getBaseUrl()) as any;
          if (courses instanceof Array) moodleConnectionStatus = 'OK';
          if (courses.message) moodleConnectionStatus = courses.message;
          else moodleConnectionStatus = 'Unknown';
        }
        catch (error) {
            moodleConnectionStatus = error.message;
        }

        const moodleLastFetchTimestamp = await getLastFetch();

        const discordLastReadyTimestamp = Math.floor(client.readyTimestamp / 1000); // To detailled timestamp

        const discordCurrentChannelId = await getDiscordChannel();

        const responseObject = {
            moodleConnectionStatus,
            moodleLastFetchTimestamp,
            moodleCurrentFetchInterval,
            discordLastReadyTimestamp,
            discordCurrentChannelId,
        };

        const response = new ApiSuccess(200, responseObject);
        next(response);
    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
