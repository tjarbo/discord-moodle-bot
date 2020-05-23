import fetch from 'node-fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { ICourse } from './course.interface';
import { IRessource } from './ressource.interface';
import { ICourseDetails } from './coursedetails.interface';
import { LastFetch } from './lastfetch.schema';

function getBaseUrl() {
    let url = config.moodle.baseURL;
    if (!url.endsWith('/')) {
        url += '/';
    }
    return  url + 'webservice/rest/server.php'
                + '?wstoken=' + config.moodle.token
                + '&moodlewsrestformat=json';
}

async function getLastFetch(): Promise<number> {
    const date = Math.floor(Date.now() / 1000);
    return LastFetch.findOneAndUpdate({}, {$set: {timestamp: date}})
            .then(query => query == null ? new LastFetch({timestamp: date}).save() : query)
            .then(query => query.timestamp);
}

/**
 * Fetches all the data from the Moodle webservice
 *
 * @export
 */
export function fetchMoodleData() {
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

async function fetchAssignments(moodleUrl: string): Promise<ICourse[]> {
    return fetch(moodleUrl + '&wsfunction=mod_assign_get_assignments')
	  .then(res => res.json())
      .then(json => json.courses)
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

async function fetchRessources(moodleUrl: string): Promise<IRessource[]> {
    return fetch(moodleUrl + '&wsfunction=mod_resource_get_resources_by_courses')
	  .then(res => res.json())
      .then(json => json.resources)
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

async function fetchEnroledCourses(moodleUrl: string): Promise<ICourseDetails[]> {
    return fetch(moodleUrl + '&wsfunction=core_enrol_get_users_courses&userid='+config.moodle.userId)
	  .then(res => res.json())
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

function printNewAssignments(courses: ICourse[], lastFetch: number):void {
    courses.forEach(course => {
        course.assignments.forEach( assignment => {
            if (assignment.timemodified > lastFetch) {
                // TODO: Call Message Function
                loggerFile.debug(course.fullname + ' --> ' + assignment.name);
            }
        });
    });
}

function printNewRessources(ressources: IRessource[], moodleUrl: string, lastFetch: number):void {
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
