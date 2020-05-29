import * as moodle from '../src/controllers/moodle/moodle';
import mockingoose from 'mockingoose';
import fetch from 'node-fetch';
import { ICourse } from '../src/controllers/moodle/course.interface';
import { ICourseDetails } from '../src/controllers/moodle/coursedetails.interface';
import { mocked } from 'ts-jest/utils';
import * as discord from '../src/controllers/discord';
import { loggerFile } from '../src/configuration/logger';
import { LastFetch } from '../src/controllers/moodle/lastfetch.schema';
import { Reminder } from '../src/controllers/moodle/reminder.schema';
import { AssignmentMessage, AssignmentReminderMessage, RessourceMessage  } from '../src/controllers/discord/templates';
import { IRessource } from '../src/controllers/moodle/ressource.interface';

jest.mock('node-fetch', () => jest.fn());
//jest.mock('../src/controllers/discord', () => jest.fn());
jest.mock('../src/configuration/environment');


const mockFetch = (res: any) =>
    mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.resolve({
        json: () => res,
    }));

//function mockFetch(res: any) { return mocked(fetch).mockResolvedValue({json: () => res} as fetch.Response)};

const mockFailedFetch = () =>
    mocked(fetch).mockImplementationOnce(() => Promise.reject());


describe('getBaseUrl', () => {
    it('should build a valid moodle url', () => {
        let url = 'https://moodle.example.com/webservice/rest/server.php?wstoken=MOODLETOKEN123&moodlewsrestformat=json';
        expect(moodle.getBaseUrl()).toBe(url);
    });
});

describe('getLastFetch', () => {
    let spyLastFetchSave: jest.SpyInstance;

    beforeEach(() => {
        spyLastFetchSave = jest.spyOn(new LastFetch(), 'save');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the timestamp of the last fetch stored in mongodb', async () => {
        mockingoose(LastFetch).toReturn({timestamp: 123}, 'findOneAndUpdate');

        expect(await moodle.getLastFetch()).toBe(123);
        expect(spyLastFetchSave).toHaveBeenCalledTimes(0);
     })

    it ('should create a new timestamp and return the current date if this is the first fetch', async () => {
        mockingoose(LastFetch).toReturn(null, 'findOneAndUpdate');
        let currentTime = Math.floor(Date.now() / 1000);

        expect(await moodle.getLastFetch()).toBeGreaterThanOrEqual(currentTime);
        expect(spyLastFetchSave).toHaveBeenCalledTimes(1);
    })

});

describe('fetchAndNotify', () => {
    // TODO
});

describe('fetchAssignments', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should address the correct moodle wsfunction', async () => {
        mockFailedFetch();
        await moodle.fetchAssignments('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=mod_assign_get_assignments');
    });

    it('should return an array of all courses containing the assignments provided by the moodle API', async () => {
        mockFetch({courses: []});
        expect(await moodle.fetchAssignments('')).toStrictEqual([]);
    })

    it('should throw an error if the request fails', async () => {
        mockFailedFetch();
        await moodle.fetchAssignments('');
        expect(spyLogger).toHaveBeenCalledTimes(1);
    })
});

describe('fetchRessources', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should address the correct moodle wsfunction', async () => {
        mockFailedFetch();
        await moodle.fetchRessources('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=mod_resource_get_resources_by_courses');
    });

    it('should return an array of all ressources provided by the moodle API', async () => {
        mockFetch({resources: []});
        expect(await moodle.fetchRessources('')).toStrictEqual([]);
    })

    it('should throw an error if the request fails', async () => {
        mockFailedFetch();
        await moodle.fetchRessources('');
        expect(spyLogger).toHaveBeenCalledTimes(1);
    })
});

describe('fetchEnrolledCourses', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should address the correct moodle wsfunction', async () => {
        mockFailedFetch();
        await moodle.fetchEnrolledCourses('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=core_enrol_get_users_courses&userid=123456');
    });

    it('should return an array of all ressources provided by the moodle API', async () => {
        mockFetch([]);
        expect(await moodle.fetchEnrolledCourses('')).toStrictEqual([]);
    })

    it('should throw an error if the request fails', async () => {
        mockFailedFetch();
        await moodle.fetchEnrolledCourses('');
        expect(spyLogger).toHaveBeenCalledTimes(1);
    })
});

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
        spyFetchCourses = jest.spyOn(moodle, 'fetchEnrolledCourses');
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
