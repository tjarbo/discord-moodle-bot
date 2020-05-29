import * as moodle from '../src/controllers/moodle/handle';
import mockingoose from 'mockingoose';
import { ICourse } from '../src/controllers/moodle/interfaces/course.interface';
import { ICourseDetails } from '../src/controllers/moodle/interfaces/coursedetails.interface';
import * as discord from '../src/controllers/discord';
import { Reminder } from '../src/controllers/moodle/schemas/reminder.schema';
import { IRessource } from '../src/controllers/moodle/interfaces/ressource.interface';
import * as moodleFetch from '../src/controllers/moodle/fetch';

describe('handleAssignments', () => {
    let spyPublish: jest.SpyInstance;
    let spyReminderSave: jest.SpyInstance;
    let mockCourses: ICourse[];

    beforeEach(() => {
        spyPublish = jest.spyOn(discord, 'publish').mockImplementation(jest.fn());
        spyReminderSave = jest.spyOn(new Reminder(), 'save');
        mockCourses = [
            { fullname: "Course01", assignments: [{ id: 0, name: "As1", duedate: 0, timemodified:  999 }] },
            { fullname: "Course02", assignments: [{ id: 1, name: "As2", duedate: 0, timemodified: 1001 }] }
        ] as ICourse[];
    });

    afterEach(() => {
        jest.resetAllMocks();
        mockingoose.resetAll();
    });

    it('should only print assignments newer than the last fetch timestamp', async () => {
        await moodle.handleAssignments(mockCourses, 1000);
        expect(spyPublish).toBeCalledTimes(1);
    });

    it('should write new reminders to the database', async () => {
        mockCourses[0].assignments[0].duedate = Math.floor(Date.now() / 1000) + 3000;
        mockingoose(Reminder).toReturn(null, 'findOne');
        await moodle.handleAssignments(mockCourses, 2000);

        expect(spyPublish).toHaveBeenCalledTimes(1);
        expect(spyReminderSave).toHaveBeenCalledTimes(1);
    });

    it('should only print new reminders', async () => {
        mockCourses[0].assignments[0].duedate = Math.floor(Date.now() / 1000) + 3000;
        mockingoose(Reminder).toReturn({assignment_id: 0}, 'findOne');
        //await moodle.handleAssignments(mockCourses, 2000);
        expect(spyPublish).toHaveBeenCalledTimes(0);
    });
});

describe('handleRessources', () => {
    let spyLogger: jest.SpyInstance;
    let spyFetchCourses: jest.SpyInstance;
    let mockRessources: IRessource[];

    beforeEach(() => {
        spyLogger = jest.spyOn(discord, 'publish').mockImplementation(jest.fn());
        spyFetchCourses = jest.spyOn(moodleFetch, 'fetchEnrolledCourses');
        spyFetchCourses.mockImplementation(() => Promise.resolve([
            { id: 1, shortname: "Course01", fullname: "Course01" },
            { id: 2, shortname: "Course02", fullname: "Course02" }
        ] as ICourseDetails[] ));
        mockRessources = [
            { course: 1, contentfiles: [{ timemodified:  999 }] },
            { course: 2, contentfiles: [{ timemodified: 1001 }] }
        ] as IRessource[];
    });

    it('should only print ressources newer than the last fetch timestamp', async () => {
        moodle.handleRessources(mockRessources, '', 1000);
        expect(spyLogger).toBeCalledTimes(0);
    })
});
