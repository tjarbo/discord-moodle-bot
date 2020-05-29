import fetch from 'node-fetch';
import { config } from '../../configuration/environment';
import { loggerFile } from '../../configuration/logger';
import { ICourse } from './interfaces/course.interface';
import { IRessource } from './interfaces/ressource.interface';
import { ICourseDetails } from './interfaces/coursedetails.interface';

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
