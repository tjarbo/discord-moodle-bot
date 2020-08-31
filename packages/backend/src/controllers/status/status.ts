import { getRefreshRate } from '../refreshRate/refreshRate';
import { LastFetch } from '../moodle/schemas/lastfetch.schema';
import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { ApiSuccess } from '../../utils/api';
import { fetchEnrolledCourses } from '../moodle/fetch';
import { getBaseUrl } from '../moodle/index';
import { client } from '../../configuration/discord';
import { getDiscordChannel } from '../discordChannel/discordChannel';

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

        const moodleCurrentFetchInterval = await getRefreshRate() || 'Error';
        let moodleLastFetchTimestamp = 'Error' as any;
        const moodleLastFetch = await LastFetch.findOne();
        if (moodleLastFetch) moodleLastFetchTimestamp = moodleLastFetch.timestamp;

        const discordLastReadyTimestamp = client.readyTimestamp;
        const discordCurrentChannelId = await getDiscordChannel();

        let discordCurrentChannelName = 'Unknown';
        try {
            discordCurrentChannelName = (client.channels.cache.get(discordCurrentChannelId) as any).name;
        }
        catch { /* continue */ }

        const responseObject = {
            moodleConnectionStatus,
            moodleLastFetchTimestamp,
            moodleCurrentFetchInterval,
            discordLastReadyTimestamp,
            discordCurrentChannelId,
            discordCurrentChannelName,
        };

        const response = new ApiSuccess(200, responseObject);
        next(response);
    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
}
