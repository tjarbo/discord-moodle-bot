import * as moodleFetch from '../src/controllers/moodle/fetch';
import * as discord from '../src/controllers/discord';
import mockingoose from 'mockingoose';
import { handleRessources, handleAssignments } from '../src/controllers/moodle/handle';
import { ICourseDetails } from '../src/controllers/moodle/interfaces/coursedetails.interface';
import { IRessource } from '../src/controllers/moodle/interfaces/ressource.interface';
import { RessourceMessage, AssignmentMessage } from '../src/controllers/discord/templates';
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
    let dateOptions: any;

    beforeEach(() => {
        spyDiscordPublish = jest.spyOn(discord, 'publish');
        spyReminderSave = jest.spyOn(new Reminder(), 'save');
        mockCourses = [
            { fullname: "Course01", shortname: "C1", assignments: [{ id: 0, name: "As1", duedate: 0, timemodified: 999 }] },
            { fullname: "Course02", shortname: "C2", assignments: [{ id: 1, name: "As2", duedate: 0, timemodified: 1001 }] }
        ] as ICourse[];
        dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should only print assignments newer than the last fetch timestamp', async () => {
        // expected are the Course with course.assignments[0].timemodified > 1000
        const expectedParameters = [
            new AssignmentMessage(),
            {
                "course": "C2",
                "dueDate": new Date(0).toLocaleString('de-DE', dateOptions),
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

describe('moodle/handle.ts handleRessources', () => {

    let spyFetchEnrolledCourses: jest.SpyInstance;
    let spyDiscordPublish: jest.SpyInstance;
    let mockRessources: IRessource[];

    beforeEach(() => {
        spyDiscordPublish = jest.spyOn(discord, 'publish');
        spyFetchEnrolledCourses = jest.spyOn(moodleFetch, 'fetchEnrolledCourses')
        spyFetchEnrolledCourses.mockResolvedValue([
            { id: 1, shortname: "Course01", fullname: "Course01" },
            { id: 2, shortname: "Course02", fullname: "Course02" }
        ] as ICourseDetails[]);

        mockRessources = [
            { course: 1, contentfiles: [{ timemodified: 999 }] },
            { course: 2, contentfiles: [{ timemodified: 1001, fileurl: 'test/webservice', filename: 'testname' }] }
        ] as IRessource[];
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should only print ressources newer than the last fetch timestamp', async () => {
        const expectedParameters = [
            new RessourceMessage(),
            {
                course: 'Course02',
                title: 'testname',
                link: 'test'
            }
        ]

        await handleRessources(mockRessources, '', 1000);
        expect(spyDiscordPublish).toBeCalledTimes(1);
        expect(spyDiscordPublish).toBeCalledWith(...expectedParameters)
    });
});
