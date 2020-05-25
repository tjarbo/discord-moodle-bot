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
 * @returns {string} The base url
 */
function getBaseUrl(): string {
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
 * @returns {number} The timestamp of last fetch (in seconds!) or
 *                   the current Date if this is the first fetch
 */
async function getLastFetch(): Promise<number> {
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
export function fetchMoodleData(): void {
    const moodleUrl = getBaseUrl();
    // TODO: Replace placeholder with real blacklist
    const courseBlacklist: number[] = [];

    getLastFetch().then(lastFetch => {
        fetchAssignments(moodleUrl)
          .then(courses => courses.filter(course => !courseBlacklist.includes(course.id)))
          .then(courses => printNewAssignments(courses, lastFetch));

        fetchRessources(moodleUrl)
          .then(ressources => ressources.filter(ressource => !courseBlacklist.includes(ressource.course)))
          .then(ressources => printNewRessources(ressources, moodleUrl, lastFetch));
    });
}

/**
 * Fetches all Assignments from the moodle instance
 * 
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourse[]>} A Promise of an array of Courses containing the Assignments
 */
async function fetchAssignments(moodleUrl: string): Promise<ICourse[]> {
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
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<IRessource[]>} A Promise of an array of Ressources
 */
async function fetchRessources(moodleUrl: string): Promise<IRessource[]> {
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
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourseDetails[]>} A Promise of an array of CourseDetails
 */
async function fetchEnroledCourses(moodleUrl: string): Promise<ICourseDetails[]> {
    return fetch(moodleUrl + '&wsfunction=core_enrol_get_users_courses&userid='+config.moodle.userId)
	  .then(res => res.json())
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

/**
 * Filters assignments by timestamp and notifies about changes
 * 
 * @param {ICourse[]} courses - The courses containing the Assignments
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
function printNewAssignments(courses: ICourse[], lastFetch: number): void {
    courses.forEach(course => {
        course.assignments.forEach( assignment => {
            if (assignment.timemodified > lastFetch) {
                // TODO: Call Message Function
                loggerFile.debug(course.fullname + ' --> ' + assignment.name);
            }
        });
    });
}

/**
 * Filters Ressources by timestamp and notifies about changes
 * 
 * @param {ICourse[]} courses - The Ressources to filter
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
function printNewRessources(ressources: IRessource[], moodleUrl: string, lastFetch: number): void {
    if (ressources.length === 0) { return; }
    const courseMap: Map<number, string> = new Map();

    fetchEnroledCourses(moodleUrl)
      .then(courses => courses.forEach(course => courseMap.set(course.id, course.shortname)))
      .then(map => ressources.forEach(ressource => {
            const coursename = courseMap.get(ressource.course);
            ressource.contentfiles.forEach(content => {
                if (content.timemodified > lastFetch) {
                    // TODO: Call Message Function
                    loggerFile.debug(coursename + ' --> ' + content.filename);
                }
            });
        })
      );
}
