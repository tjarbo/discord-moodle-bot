import * as moodle from '../src/controllers/moodle/';
import * as moodleFetch from '../src/controllers/moodle/fetch';
import * as moodleHandle from '../src/controllers/moodle/handle';
import mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { MoodleSettings } from '../src/controllers/moodle/schemas/moodle.schema';
import { ICourse } from '../src/controllers/moodle/interfaces/course.interface';
import { IResource } from '../src/controllers/moodle/interfaces/resource.interface';
import * as courseList from '../src/controllers/courseList/courseList';
import { ICourseDetails } from '../src/controllers/moodle/interfaces/coursedetails.interface';

jest.mock('../src/configuration/environment.ts');
jest.mock('../src/controllers/moodle/fetch.ts');

jest.useFakeTimers();

describe('getBaseUrl', () => {
    it('should build a valid moodle url', () => {
        let url = 'https://moodle.example.com/webservice/rest/server.php?wstoken=MOODLETOKEN123&moodlewsrestformat=json';
        expect(moodle.getBaseUrl()).toBe(url);
    });
});

describe('fetchAndNotify', () => {
    let spyLogger: jest.SpyInstance;
    let spyFetchAssignments: jest.SpyInstance;
    let spyFetchResources: jest.SpyInstance;
    let spyFetchEnrolledCourses: jest.SpyInstance;

    const MoodleSettingsReturn = {
        refreshRate: 12,
        lastFetch: 13,
    }
    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
        spyFetchAssignments = jest.spyOn(moodleFetch, 'fetchAssignments');
        spyFetchResources = jest.spyOn(moodleFetch, 'fetchResources');
        
        jest.spyOn(courseList, 'getCourseBlacklist').mockResolvedValue([]);
        spyFetchEnrolledCourses = jest.spyOn(moodleFetch, 'fetchEnrolledCourses')
        spyFetchEnrolledCourses.mockResolvedValue([
            { id: 1, shortname: "Course01", fullname: "Course01" },
            { id: 2, shortname: "Course02", fullname: "Course02" }
        ] as ICourseDetails[]);

        jest.spyOn(moodleHandle, 'handleAssignments').mockImplementation(jest.fn());
        jest.spyOn(moodleHandle, 'handleContents').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    

    it('should log error if fetchAssignments fails', async () => {
        mockingoose(MoodleSettings).toReturn(MoodleSettingsReturn, 'findOne');
        spyFetchAssignments.mockRejectedValueOnce(new Error('Failed1'));
        spyFetchResources.mockResolvedValue([] as IResource[]);
        await moodle.fetchAndNotify();

        expect(spyLogger).toHaveBeenCalledTimes(1);
        expect(spyLogger).toHaveBeenCalledWith('Moodle API request failed', new Error('Failed1'));
    });

    it('should log no error if everything is fine', async () => {
        mockingoose(MoodleSettings).toReturn(MoodleSettingsReturn, 'findOne');
        spyFetchAssignments.mockResolvedValueOnce([] as ICourse[]);
        spyFetchResources.mockResolvedValueOnce([] as IResource[]);
        await moodle.fetchAndNotify();

        expect(spyLogger).toHaveBeenCalledTimes(0);
    });

});

describe('continuousFetchAndNotify', () => {
    let spyFetchAndNotify: jest.SpyInstance;

    const MoodleSettingsReturn = {
        refreshRate: 12,
        lastFetch: 13,
    }

    beforeEach(() => {
        spyFetchAndNotify = jest.spyOn(moodle, 'fetchAndNotify');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should call setTimeout with value which is stored in mongodb', async () => {
        spyFetchAndNotify.mockResolvedValueOnce(true);
        mockingoose(MoodleSettings).toReturn(MoodleSettingsReturn, 'findOne');

        await moodle.continuousFetchAndNotify();
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenCalledWith(moodle.continuousFetchAndNotify, MoodleSettingsReturn.refreshRate)
    });
});