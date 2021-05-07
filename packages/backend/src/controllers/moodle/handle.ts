import { config } from '../../configuration/environment';
import { ICourse } from './interfaces/course.interface';
import { IResource } from './interfaces/resource.interface';
import { connectorService } from '../connectors/service';
import { AssignmentMessage, AssignmentMessageOptions, AssignmentReminderMessage, AssignmentReminderMessageOptions, ResourceMessage, ResourceMessageOptions  } from '../messages/templates';
import { Reminder } from './schemas/reminder.schema';
import { IContentfile } from './interfaces/contentfile.interface';

/**
 * Filters assignments by timestamp and notifies about changes and upcoming deadline
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The courses containing the Assignments
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleAssignments(courses: ICourse[], lastFetch: number): Promise<void> {

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    } as Intl.DateTimeFormatOptions;

    for (const course of courses) {
        for (const assignment of course.assignments) {
            const coursename = config.moodle.useCourseShortname ? course.shortname : course.fullname;

            // check if assignment was newly created or has been modified
            if (assignment.timemodified > lastFetch) {
                const options: AssignmentMessageOptions = {
                    course: coursename,
                    title: assignment.name,
                    dueDate: new Date(assignment.duedate * 1000).toLocaleString('de-DE', dateOptions)
                };

                connectorService.publish(null, null, new AssignmentMessage(), options);
            }

            // check if new deadline is incoming that hasn`t been notified about
            const timeUntilDueDate = assignment.duedate - Math.floor(Date.now() / 1000);
            const isWithinDeadline = timeUntilDueDate > 0 && timeUntilDueDate < config.moodle.reminderTimeLeft;
            const reminderExists = await Reminder.findOne({assignment_id: assignment.id});

            if (isWithinDeadline && !reminderExists) {
                const options: AssignmentReminderMessageOptions = {
                    course: coursename,
                    title: assignment.name
                };
                await new Reminder({assignment_id: assignment.id}).save();
                connectorService.publish(null, null, new AssignmentReminderMessage(), options);
            }
        }
    }
}

/**
 * Recursively extracts the files of the contents object
 *
 * @param contents - The contents to extract
 * @returns {IContentfile[]} - The contentfiles
 */
function extractContentFiles(contents: any): IContentfile[] {
    // extract files from array
    function extractObject(input:any) {
        if (Object.keys(input).includes('type') && input.type === 'file') {
            fileArray.push(input as IContentfile);
            return;
        }
        for (const value of Object.values(input)){
            if (value instanceof Array) extractArray(value);
            else if (value instanceof Object) extractObject(value);
        }
    }
    function extractArray(input:any){
        for (const element of input){
            if (element instanceof Array) extractArray(element);
            else if (element instanceof Object) extractObject(element);
        }
    }
    const fileArray:IContentfile[] = [];
    extractArray(contents);
    return fileArray;
}

/**
 * Extracts contents, filters them by timestamp and notifies about changes
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {ICourse[]} courses - The Resources to filter
 * @param {string} courseName - Maps course Ids to course names
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleContents(contents: any, courseName: string, lastFetch: number): Promise<void> {
    const fileArray = extractContentFiles(contents);

    for (const file of fileArray) {
        if (file.timemodified <= lastFetch) continue;

        const options: ResourceMessageOptions = {
            course: courseName,
            title: file.filename,
            link: file.fileurl.replace('/webservice', '')
        };
        connectorService.publish(null, null, new ResourceMessage(), options);
    }
}

/**
 * @deprecated Ignores files on sublevels, use fetchCourseContents and handleContents instead.
 * ! export only for unit testing (rewire doesn't work :/ )
 *
 * Filters Resources by timestamp and notifies about changes
 *
 * @param {IResource[]} resources - The Resources to filter
 * @param {Map<number, string>} courseMap - Maps course Ids to course names
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleResources(resources: IResource[], courseMap: Map<number, string>, lastFetch: number): Promise<void> {
    for (const resource of resources) {
        for (const file of resource.contentfiles) {
            if (file.timemodified <= lastFetch) continue;

            const options: ResourceMessageOptions = {
                course: courseMap.get(resource.course),
                title: file.filename,
                link: file.fileurl.replace('/webservice', '')
            };
            connectorService.publish(null, null, new ResourceMessage(), options);
        }
    }
}
