import { CourseList, ICourseListSchema } from './courseList.schema';
import { fetchEnrolledCourses } from '../moodle/fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';
import { getBaseUrl } from '../moodle/index';
import { Request, Response, NextFunction } from 'express';
import { object, number, boolean } from '@hapi/joi';
import { ApiSuccess, ApiError } from '../../utils/api';
import { JWT } from '../authentication';


/**
 * Creates a blacklist for excluding some courses from notification.
 * @returns A list of course IDs for courses where no notification is desired.
 */
export async function getCourseBlacklist():Promise<number[]>{
    let dbCourses = await CourseList.find();
    if (!dbCourses) dbCourses = await getCourseList() as (ICourseListSchema & { _id: any; })[]; // Create database entrys if there is nothing yet
    const result:number[] = [];
    dbCourses.forEach(element => {
        if (!element.isActive) result.push(element.courseId);
    });
    return result;
}

/**
 * Fetches all moodle courses and compares them with the database.
 * @returns A List of objects with course name, id and active status.
 */
export async function getCourseList():Promise<ICourseListSchema[]>{
    const moodleCourses = await fetchEnrolledCourses(getBaseUrl());
    if ((moodleCourses as any).exception === 'moodle_exception') throw new ApiError(500,  'Courses could not be loaded.');
    const result:any[] = [];
    for (const element of moodleCourses){
        const courseName = (config.moodle.useCourseShortname ? element.shortname : element.fullname);
        let dbCourse = await CourseList.findOne({courseId: element.id});
        if (!dbCourse) dbCourse = await new CourseList({courseId: element.id, name: courseName, isActive: true}).save();
        result.push({courseId: dbCourse.courseId, name: dbCourse.name, isActive: dbCourse.isActive});
    }
    return result;
}

/**
 * Handles GET /api/settings/courses requests and responds
 * with an array of course objects of type ICourseListSchema.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getCourseListRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const courses = await getCourseList();
        if (courses.length === 0) throw new ApiError(404, 'No courses found');

        const response = new ApiSuccess(200, courses);
        next(response);
    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }

/**
 * Method for setting a course active or inactive
 * @param courseId {number} ID of the course to be modified
 * @param active {boolean} Boolean for setting the course to active or not
 */
export async function setCourse(courseId: number, isActive: boolean):Promise<void>{
    await CourseList.findOneAndUpdate({courseId}, {$set: {isActive}});
}

// Schema for validating api input
const courseRequestSchema = object({
    params: object({
        id: number().greater(0).less(2147483647).required()
    }).required(),
    body: object({
        isActive: boolean().required()
    }).required()
}).unknown(true);

/**
 * Handles PUT /api/settings/courses/:id requests.
 * @param req Request: Contains course id and boolean value
 * @param res Response
 * @param next NextFunction
 */
export async function setCourseRequest(req: Request & JWT, res: Response, next: NextFunction) {

    try {
        // Input validation
        const request = courseRequestSchema.validate(req);
        if (request.error) throw new ApiError(400, request.error.message);

        // Parse input
        const courseId = request.value.params.id;
        const isActive = request.value.body.isActive;

        // Get all course ids
        let dbCourses = await CourseList.find();
        if (!dbCourses) dbCourses = await getCourseList() as (ICourseListSchema & { _id: any; })[]; // Create database entrys if there is nothing yet
        const courseIds:number[] = [];
        dbCourses.forEach(element => {
            courseIds.push(element.courseId);
        });

        // Check if course exists
        if (!(courseIds.includes(courseId))) throw new ApiError(404, 'Course not found');

        // Method call and exit
        await setCourse(courseId, isActive);

        // Send back the new list of all courses
        const courses = await getCourseList();
        if (courses.length === 0) throw new ApiError(404, 'No courses found');

        loggerFile.info(`Course list updated by "${req.token.data.username}"`);
        const response = new ApiSuccess(200, courses);
        next(response);

    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }
