import { config } from '../../configuration/environment';
import { ICourse } from './interfaces/course.interface';
import { IRessource } from './interfaces/ressource.interface';
import { publish } from '../discord';
import { AssignmentMessage, AssignmentMessageOptions, AssignmentReminderMessage, AssignmentReminderMessageOptions, RessourceMessage, RessourceMessageOptions  } from '../discord/templates';
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
    };

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

                await publish(new AssignmentMessage(), options);
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
                await publish(new AssignmentReminderMessage(), options);
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
function extractContentfiles(contents: any): IContentfile[] {
    // extract files from array
    function extractObject(input:any) {
        for (const value of Object.values(input)){
            if (value === 'file') fileArray.push(input as IContentfile);
            if (value instanceof Object) extractObject(value);
            if (value instanceof Array) extractArray(value);
        }
    }
    function extractArray(input:any){
        for (const element of input){
            if (element instanceof Object) extractObject(element);
            if (element instanceof Array) extractArray(element);
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
 * @param {ICourse[]} courses - The Ressources to filter
 * @param {string} courseName - Maps course Ids to course names
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleContents(contents: any, courseName: string, lastFetch: number): Promise<void> {
    const fileArray = extractContentfiles(contents);
    // this is currently used as a workaround, because for
    // some reason every file would be published twice
    const published: string[] = [];
    for (const file of fileArray) {
        if (file.timemodified <= lastFetch || published.includes(file.fileurl)) continue;

        const options: RessourceMessageOptions = {
            course: courseName,
            title: file.filename,
            link: file.fileurl.replace('/webservice', '')
        };
        published.push(file.fileurl);
        publish(new RessourceMessage(), options);
    }
}

/**
 * Filters Ressources by timestamp and notifies about changes
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {IRessource[]} ressources - The Ressources to filter
 * @param courseMap - Maps course Ids to course names
 * @param {number} lastFetch - The timestamp of the last fetch (in seconds!)
 */
export async function handleRessources(ressources: IRessource[], courseMap: any, lastFetch: number): Promise<void> {
    for (const ressource of ressources) {
        for (const file of ressource.contentfiles) {
            if (file.timemodified <= lastFetch) continue;

            const options: RessourceMessageOptions = {
                course: courseMap.get(ressource.course),
                title: file.filename,
                link: file.fileurl.replace('/webservice', '')
            };
            publish(new RessourceMessage(), options);
        }
    }
}
