import fetch from 'node-fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { ICourse } from './course.interface';
import { IRessource } from './ressource.interface';
import { ICourseDetails } from './coursedetails.interface';
import { LastFetch } from './lastfetch.schema';

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
    return LastFetch.findOneAndUpdate({}, {$set: {timestamp: now}})
            .then(query => query == null ? new LastFetch({timestamp: now}).save() : query)
            .then(query => query.timestamp);
}

/**
 * Fetches all data from the Moodle webservice, filters it
 * and notifies about newly created or updated ressources
 *
 * @export
 */
export async function fetchMoodleData(): Promise<any[]> {
    try {
        const moodleUrl = getBaseUrl();
        // TODO: Replace placeholder with real blacklist
        const courseBlacklist: number[] = [];

        const lastFetch = await getLastFetch();
        if (!lastFetch) throw new Error('Unable to get timestamp of last fetch');

        console.log('askudgvaeöghwöagawrfpwa', getBaseUrl());

        const ass = await fetchAssignments(moodleUrl)
            .then(courses => courses.filter(course => !courseBlacklist.includes(course.id)))
            .then(courses => printNewAssignments(courses, lastFetch));
            
        console.log('askudgvaeöghwöagawrfpwa', lastFetch);

        const res = await fetchRessources(moodleUrl)
            .then(ressources => ressources.filter(ressource => !courseBlacklist.includes(ressource.course)))
            .then(ressources => printNewRessources(ressources, moodleUrl, lastFetch));

        return Promise.all([ass, res]);

    } catch(error) {
        console.log(error);
        loggerFile.error('Moodle API request failed', error);
    };
}

/**
 * Fetches all Assignments from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourse[]>} A Promise of an array of Courses containing the Assignments
 */
export async function fetchAssignments(moodleUrl: string): Promise<ICourse[]> {
    return fetch(moodleUrl + '&wsfunction=mod_assign_get_assignments')
      .then(res => res.json())
      .then(json => json.courses)
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

/**
 * Fetches all Ressources (Files etc) from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<IRessource[]>} A Promise of an array of Ressources
 */
export async function fetchRessources(moodleUrl: string): Promise<IRessource[]> {
    return fetch(moodleUrl + '&wsfunction=mod_resource_get_resources_by_courses')
      .then(res => res.json())
      .then(json => json.resources)
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

/**
 * Fetches all Courses (CourseDetails) from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourseDetails[]>} A Promise of an array of CourseDetails
 */
export async function fetchEnrolledCourses(moodleUrl: string): Promise<ICourseDetails[]> {
    return fetch(moodleUrl + '&wsfunction=core_enrol_get_users_courses&userid='+config.moodle.userId)
	  .then(res => res.json())
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

/**
 * Filters assignments by timestamp and notifies about changes
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The courses containing the Assignments
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export function printNewAssignments(courses: ICourse[], lastFetch: number): void {
    courses.forEach(course => course.assignments
        .filter(assignment => assignment.timemodified > lastFetch)
        .forEach(assignment => loggerFile.debug(course.fullname + ' --> ' + assignment.name)));
}

/**
 * Filters Ressources by timestamp and notifies about changes
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The Ressources to filter
 * @param {string} moodleUrl - Url of the moodle instance to fetch coursedetails from
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function printNewRessources(ressources: IRessource[], moodleUrl: string, lastFetch: number): Promise<void> {
    if (ressources.length === 0) { return; }
    const courseMap: Map<number, string> = new Map();

    await fetchEnrolledCourses(moodleUrl).then(courses => 
        courses.forEach(course => courseMap.set(course.id, course.shortname)));
    
    ressources.forEach(ressource => {
        const coursename = courseMap.get(ressource.course);
        ressource.contentfiles.filter(content => content.timemodified > lastFetch)
            .forEach(content => loggerFile.debug(coursename + ' --> ' + content.filename));
    });
}
