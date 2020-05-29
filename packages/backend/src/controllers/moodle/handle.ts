import { config } from '../../configuration/environment';
import { fetchEnrolledCourses } from './fetch';
import { ICourse } from './interfaces/course.interface';
import { IRessource } from './interfaces/ressource.interface';
import { publish } from '../discord';
import { AssignmentMessage, AssignmentReminderMessage, RessourceMessage  } from '../discord/templates';
import { Reminder } from './schemas/reminder.schema';

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
