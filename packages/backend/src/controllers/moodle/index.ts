import { config } from '../../configuration/environment';
import { loggerFile } from '../../configuration/logger';
import { getCourseBlacklist } from '../courseList/courseList';
import { fetchAssignments, fetchEnrolledCourses, fetchCourseContents } from './fetch';
import { handleAssignments, handleContents } from './handle';
import { MoodleSettings } from './schemas/moodle.schema';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/api';
import { ApiSuccess } from '../../utils/api';

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
 * Fetches all data from the Moodle webservice, filters it
 * and notifies about newly created or updated resources
 *
 * @export
 */
export async function fetchAndNotify(): Promise<boolean> {
  try {
    const moodleUrl = getBaseUrl();
    const courseBlacklist: number[] = await getCourseBlacklist();

    let lastFetch = await MoodleSettings.getLastFetch();
    // use current time if lastFetch is 0
    if (!lastFetch) lastFetch = Math.floor(Date.now() / 1000);

    // get all course IDs and map them to corresponding course names
    const courseDetails = await fetchEnrolledCourses(moodleUrl);
    const courseMap: Map<number, string> = new Map();
    courseDetails.forEach(course => courseMap.set(course.id, course.shortname));

    // fetch and handle course contents
    for (const courseId of courseMap.keys()) {
      if (courseBlacklist.includes(courseId)) continue;
      const content = await fetchCourseContents(moodleUrl, courseId);
      handleContents(content, courseMap.get(courseId), lastFetch);
    }

    const courseList = await fetchAssignments(moodleUrl).then(courses =>
      courses.filter(course => !courseBlacklist.includes(course.id)));

    handleAssignments(courseList, lastFetch);

    await MoodleSettings.findOneAndUpdate({}, { $set: { lastFetch: Math.floor(Date.now() / 1000) }});
    return true;
  } catch(error) {
    loggerFile.error('Moodle API request failed', error);
    return false;
  }
}

/**
 * Calls the fetchAndNotify function in the current refresh rate interval.
 *
 * @export
 */
export async function continuousFetchAndNotify(): Promise<void> {

  fetchAndNotify();

  // Call function again after database interval
  const interval = await MoodleSettings.getRefreshRate();
  const nextFetch = Math.floor(Date.now() / 1000) + interval;
  MoodleSettings.findOneAndUpdate({}, { $set: { nextFetch }});
  setTimeout(continuousFetchAndNotify, interval);
}

/**
 * Handles GET /api/fetch to trigger a moodle-fetch
 * @export
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function manualFetchRequest(req: Request, res: Response, next: NextFunction) {
  try {
    loggerFile.debug('Performing manual fetch, triggered by http request');
    const wasSuccessful = await fetchAndNotify();
    const failed = new ApiError(500, 'Failed to fetch data from moodle. See logs for more information!');
    const success = new ApiSuccess();

    wasSuccessful ? next(success) : next(failed);
  } catch (err) {
    loggerFile.error(err.message || err);
    next(err);
  }
}
