import fetch from 'node-fetch';
import { config } from '../../configuration/environment';
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
    const res = await fetch(moodleUrl + '&wsfunction=mod_assign_get_assignments');
    return (await res.json()).courses;
}

/**
 * Fetches all Ressources (Files etc) from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<IRessource[]>} A Promise of an array of Ressources
 */
export async function fetchRessources(moodleUrl: string): Promise<IRessource[]> {
    const res = await fetch(moodleUrl + '&wsfunction=mod_resource_get_resources_by_courses');
    return (await res.json()).resources;
}

/**
 * Fetches all Courses (CourseDetails) from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @returns {Promise<ICourseDetails[]>} A Promise of an array of CourseDetails
 */
export async function fetchEnrolledCourses(moodleUrl: string): Promise<ICourseDetails[]> {
    const res = await fetch(moodleUrl + '&wsfunction=core_enrol_get_users_courses&userid='+config.moodle.userId);
	return await res.json();
}

/**
 * Fetches all contents of one course from the moodle instance
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {string} moodleUrl - Moodle Web Service Url
 * @param {number} courseId - The course to fetch contents from
 * @returns {Promise<any>} A Promise of course contents, currently not defined through any schema
 */
export async function fetchCourseContents(moodleUrl: string, courseId: number): Promise<any> {
    const res = await fetch(moodleUrl + '&wsfunction=core_course_get_contents&courseid='+courseId);
	return await res.json();
}
