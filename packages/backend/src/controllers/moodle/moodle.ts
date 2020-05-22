import fetch from 'node-fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { ICourse } from './course.interface';
import { IAssignment } from './assignment.interface';
import { IRessource } from './ressource.interface';

function getBaseUrl() {
    let url = config.moodle.baseURL;
    if (!url.endsWith('/')) {
        url += '/';
    }
    return  url + 'webservice/rest/server.php'
                + '?wstoken=' + config.moodle.token
                + '&moodlewsrestformat=json';
}

/**
 * Fetches all the data from the Moodle webservice
 *
 * @export
 */
export function fetchMoodleData() {
    const moodleUrl = getBaseUrl();
    const courseBlacklist: number[] = [];
    const lastFetch = 1587718762; // timestamp Blatt 05

    let assignments = fetchAssignments(moodleUrl)
      .then(courses => courses.filter(course => !courseBlacklist.includes(course.id)))
      .then(courses => filterAssignments(courses, lastFetch));

    let reslist = fetchRessources(moodleUrl)
      .then(ressources => ressources.filter(ressource => !courseBlacklist.includes(ressource.course)))
      .then(ressources => ressources.filter(ressource => ressource.timemodified > lastFetch));

    // TODO: Recursively call Method with given timeout.
    // mind the recursion loop!!!
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

function filterAssignments(courses: ICourse[], timestamp: number):IAssignment[] {
    const assignments: IAssignment[] = [];
    courses.forEach(course => {
        course.assignments.forEach( assignment => {
            if (assignment.timemodified > timestamp)
                assignments.push(assignment);
        });
    });
    return assignments;
}
