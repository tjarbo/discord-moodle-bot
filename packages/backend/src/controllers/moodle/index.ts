import { config } from '../../configuration/environment';
import { loggerFile } from '../../configuration/logger';
import { LastFetch } from './schemas/lastfetch.schema';
import { getCourseBlacklist } from '../courseList/courseList';
import { fetchAssignments, fetchRessources, fetchEnrolledCourses, fetchCourseContents } from './fetch';
import { handleAssignments, handleRessources, handleContents } from './handle';

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
    let lastFetch = await LastFetch.findOneAndUpdate({}, {$set: {timestamp: now}});
    if (!lastFetch) lastFetch = await new LastFetch({timestamp: now}).save();
    return lastFetch.timestamp;
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
        const courseBlacklist: number[] = await getCourseBlacklist();

        const lastFetch = await getLastFetch();
        if (!lastFetch) throw new Error('Unable to get timestamp of last fetch');

        // get all course IDs and map them to corresponding course names
        const coursedetails = await fetchEnrolledCourses(moodleUrl);
        const courseMap: Map<number, string> = new Map();
        coursedetails.forEach(course => courseMap.set(course.id, course.shortname));

        // fetch and handle course contents
        for (const courseId of courseMap.keys()) {
            if (courseBlacklist.includes(courseId)) continue;
            const content = await fetchCourseContents(moodleUrl, courseId);
            handleContents(content, courseMap.get(courseId), lastFetch);
        }

        const courselist = await fetchAssignments(moodleUrl).then(courses =>
            courses.filter(course => !courseBlacklist.includes(course.id)));

        const ressourcelist = await fetchRessources(moodleUrl).then(ressources =>
            ressources.filter(ressource => !courseBlacklist.includes(ressource.course)));

        handleAssignments(courselist, lastFetch);
        handleRessources(ressourcelist, courseMap, lastFetch);

    } catch(error) {
        loggerFile.error('Moodle API request failed', error);
    }
}
