import fetch from 'node-fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { ICourse } from './course.interface';
import { IRessource } from './ressource.interface';
import { ICourseDetails } from './coursedetails.interface';
import { LastFetch } from './lastfetch.schema';
import { publish } from '../discord';
import { AssignmentMessage, AssignmentReminderMessage, RessourceMessage  } from '../discord/templates';
import { Reminder } from './reminder.schema';

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
        console.log(error);
        loggerFile.error('Moodle API request failed', error);
    }
}

/**
 * Fetches all Assignments from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourse[]>} A Promise of an array of Courses containing the Assignments
 */
export async function fetchAssignments(moodleUrl: string): Promise<ICourse[]> {
    return await fetch(moodleUrl + '&wsfunction=mod_assign_get_assignments')
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
    return await fetch(moodleUrl + '&wsfunction=mod_resource_get_resources_by_courses')
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
    return await fetch(moodleUrl + '&wsfunction=core_enrol_get_users_courses&userid='+config.moodle.userId)
	    .then(res => res.json())
    .catch((error) => {
        loggerFile.error('Moodle API request failed', error);
    });
}

/**
 * Filters assignments by timestamp and notifies about changes and upcoming deadline
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The courses containing the Assignments
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleAssignments(courses: ICourse[], lastFetch: number): Promise<void> {
    
    for (const course of courses) {
        for (const assignment of course.assignments) {
            const coursename = config.moodle.useCourseShortname ? course.shortname : course.fullname;
            
            // check if assignment was newly created or has been modified
            if (assignment.timemodified > lastFetch) {
                await publish(new AssignmentMessage(), {
                    course: coursename,
                    title: assignment.name,
                    dueDate: new Date(assignment.duedate * 1000)
                });
            }

            // check if new deadline is incoming that hasn`t been notified about
            const timeUntilDueDate = assignment.duedate - Math.floor(Date.now() / 1000);
            const isWithinDeadline = timeUntilDueDate > 0 && timeUntilDueDate < config.moodle.reminderTimeLeft;
            const query = await Reminder.findOne({assignment_id: assignment.id});

            if (isWithinDeadline && query == null) {
                await new Reminder({assignment_id: assignment.id}).save();
                await publish(new AssignmentReminderMessage(), {
                    course: coursename,
                    title: assignment.name
                });
            }
        }
    }
}

/**
 * Filters Ressources by timestamp and notifies about changes
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The Ressources to filter
 * @param {string} moodleUrl - Url of the moodle instance to fetch coursedetails from
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleRessources(ressources: IRessource[], moodleUrl: string, lastFetch: number): Promise<void> {
    if (ressources.length === 0) { return; }

    // map course IDs to course names
    const courseMap: Map<number, string> = new Map();
    await fetchEnrolledCourses(moodleUrl).then(courses =>
        courses.forEach(course => courseMap.set(course.id, course.shortname)));

    // publish new files
    ressources.forEach(ressource => ressource.contentfiles.forEach(
        file => publish(new RessourceMessage(), {
            course: courseMap.get(ressource.course),
            title: file.filename,
            link: file.fileurl.replace('/webservice', '')
        })
    ));
}
