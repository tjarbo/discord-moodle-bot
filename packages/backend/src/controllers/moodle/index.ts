import { config } from '../../configuration/environment';
import { loggerFile } from '../../configuration/logger';
import { LastFetch } from './schemas/lastfetch.schema';
import { fetchAssignments , fetchRessources } from './fetch';
import { handleAssignments, handleRessources } from './handle';

/**
 * Builds a string representing the moodle
 * base url that web requests are being send to
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @returns {string} The base url
 */
export function getBaseUrl(): string {
    let url = config.moodle.baseURL;
    if (!url.endsWith('/')) {
        url += '/';
    }
    return  url + 'webservice/rest/server.php'
                + '?wstoken=' + config.moodle.token
                + '&moodlewsrestformat=json';
}

/**
 * Reads timestamp of the last fetch from database
 * (Creates a new one if this is the first fetch)
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @returns {number} The timestamp of last fetch (in seconds!) or
 *                   the current Date if this is the first fetch
 */
export async function getLastFetch(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    return await LastFetch.findOneAndUpdate({}, {$set: {timestamp: now}})
            .then(query => query == null ? new LastFetch({timestamp: now}).save() : query)
            .then(query => query.timestamp);
}

/**
 * Fetches all data from the Moodle webservice, filters it
 * and notifies about newly created or updated ressources
 *
 * @export
 */
export async function fetchAndNotify(): Promise<void> {
    try {
        const moodleUrl = getBaseUrl();
        // TODO: Replace placeholder with real blacklist
        const courseBlacklist: number[] = [];

        const lastFetch = await getLastFetch();
        if (!lastFetch) throw new Error('Unable to get timestamp of last fetch');

        const courselist = await fetchAssignments(moodleUrl).then(courses =>
            courses.filter(course => !courseBlacklist.includes(course.id)));

        const ressourcelist = await fetchRessources(moodleUrl).then(ressources =>
            ressources.filter(ressource => !courseBlacklist.includes(ressource.course)));

        handleAssignments(courselist, lastFetch);
        handleRessources(ressourcelist, moodleUrl, lastFetch);

    } catch(error) {
        loggerFile.error('Moodle API request failed', error);
    }
}
