import * as discord from '../src/controllers/discord';
import mockingoose from 'mockingoose';
import { handleResources, handleAssignments } from '../src/controllers/moodle/handle';
import { IResource } from '../src/controllers/moodle/interfaces/resource.interface';
import { ResourceMessage, AssignmentMessage } from '../src/controllers/discord/templates';
import { ICourse } from '../src/controllers/moodle/interfaces/course.interface';
import { Reminder } from '../src/controllers/moodle/schemas/reminder.schema';

jest.mock('../src/configuration/discord.ts');
jest.mock('../src/configuration/environment.ts');
jest.mock('../src/controllers/discord/index.ts');
jest.mock('../src/controllers/moodle/fetch.ts');


describe('moodle/handle.ts handleAssignments', () => {
    let spyDiscordPublish: jest.SpyInstance;
    let spyReminderSave: jest.SpyInstance;
    let mockCourses: ICourse[];
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

    beforeEach(() => {
        spyDiscordPublish = jest.spyOn(discord, 'publish');
        spyReminderSave = jest.spyOn(new Reminder(), 'save');
        mockCourses = [
            { fullname: "Course01", shortname: "C1", assignments: [{ id: 0, name: "As1", duedate: 1, timemodified: 999 }] },
            { fullname: "Course02", shortname: "C2", assignments: [{ id: 1, name: "As2", duedate: 1, timemodified: 1001 }] }
        ] as ICourse[];
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should only print assignments newer than the last fetch timestamp', async () => {
        // expected are the Courses with course.assignments[0].timemodified > 1000
        const expectedParameters = [
            new AssignmentMessage(),
            {
                "course": "C2",
                "dueDate": new Date(1).toLocaleString('de-DE', dateOptions),
                "title": "As2",
            }
        ]

        await handleAssignments(mockCourses, 1000);
        expect(spyDiscordPublish).toBeCalledTimes(1);
        expect(spyDiscordPublish).toBeCalledWith(...expectedParameters);
    });

    it('should write new reminders to the database', async () => {
        mockCourses[0].assignments[0].duedate = Math.floor(Date.now() / 1000) + 3000;
        mockingoose(Reminder).toReturn(null, 'findOne');
        await handleAssignments(mockCourses, 2000);

        expect(spyDiscordPublish).toHaveBeenCalledTimes(1);
        expect(spyReminderSave).toHaveBeenCalledTimes(1);
    });

    it('should only print new reminders', async () => {
        mockCourses[0].assignments[0].duedate = Math.floor(Date.now() / 1000) + 3000;
        mockingoose(Reminder).toReturn({ assignment_id: 0 }, 'findOne');

        expect(spyDiscordPublish).toHaveBeenCalledTimes(0);
    });
});

describe('moodle/handle.ts handleResources', () => {

    let spyDiscordPublish: jest.SpyInstance;
    let mockResources: IResource[];
    const courseMap = new Map().set(1, 'Course01').set(2, 'Course02');

    beforeEach(() => {
        spyDiscordPublish = jest.spyOn(discord, 'publish');
        mockResources = [
            { course: 1, contentfiles: [{ timemodified: 999 }] },
            { course: 2, contentfiles: [{ timemodified: 1001, fileurl: 'test/webservice', filename: 'testname' }] }
        ] as IResource[];
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should only print resources newer than the last fetch timestamp', async () => {
        const expectedParameters = [
            new ResourceMessage(),
            {
                course: 'Course02',
                title: 'testname',
                link: 'test'
            }
        ]

        await handleResources(mockResources, courseMap, 1000);
        expect(spyDiscordPublish).toBeCalledTimes(1);
        expect(spyDiscordPublish).toBeCalledWith(...expectedParameters)
    });
});
