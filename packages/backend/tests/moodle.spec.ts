import * as moodle from '../src/controllers/moodle/';
import * as moodleFetch from '../src/controllers/moodle/fetch';
import * as moodleHandle from '../src/controllers/moodle/handle';
import mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { LastFetch } from '../src/controllers/moodle/schemas/lastfetch.schema';
import { ICourse } from '../src/controllers/moodle/interfaces/course.interface';
import { IResource } from '../src/controllers/moodle/interfaces/ressource.interface';
import * as courseList from '../src/controllers/courseList/courseList';
import { ICourseDetails } from '../src/controllers/moodle/interfaces/coursedetails.interface';

jest.mock('../src/configuration/environment.ts');
jest.mock('../src/controllers/moodle/fetch.ts');
jest.mock('../src/configuration/discord.ts');
jest.mock('../src/controllers/discord/index.ts');


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
     });

    it ('should create a new timestamp and return the current date if this is the first fetch', async () => {
        mockingoose(LastFetch).toReturn(null, 'findOneAndUpdate');
        let currentTime = Math.floor(Date.now() / 1000);

        expect(await moodle.getLastFetch()).toBeGreaterThanOrEqual(currentTime);
        expect(spyLastFetchSave).toHaveBeenCalledTimes(1);
    });

});

describe('fetchAndNotify', () => {
    let spyLogger: jest.SpyInstance;
    let spyFetchAssignments: jest.SpyInstance;
    let spyFetchRessources: jest.SpyInstance;
    let spyFetchEnrolledCourses: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
        spyFetchAssignments = jest.spyOn(moodleFetch, 'fetchAssignments');
        spyFetchRessources = jest.spyOn(moodleFetch, 'fetchRessources');
        
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
    
    it('should log error if lastFetch doesn`t return any value', async () => {
        mockingoose(LastFetch).toReturn(new Error(), 'findOneAndUpdate');
        await moodle.fetchAndNotify();

        expect(spyLogger).toHaveBeenCalledTimes(1);
        expect(spyLogger).toHaveBeenCalledWith('Moodle API request failed', new Error());
    });

    it('should log error if fetchAssignments fails', async () => {
        mockingoose(LastFetch).toReturn({timestamp: 1}, 'findOneAndUpdate');
        spyFetchAssignments.mockRejectedValueOnce(new Error('Failed1'));
        spyFetchRessources.mockResolvedValue([] as IResource[]);
        await moodle.fetchAndNotify();

        expect(spyLogger).toHaveBeenCalledTimes(1);
        expect(spyLogger).toHaveBeenCalledWith('Moodle API request failed', new Error('Failed1'));
    });

    it('should log no error if everything is fine', async () => {
        mockingoose(LastFetch).toReturn({timestamp: 1}, 'findOneAndUpdate');
        spyFetchAssignments.mockResolvedValueOnce([] as ICourse[]);
        spyFetchRessources.mockResolvedValueOnce([] as IResource[]);
        await moodle.fetchAndNotify();

        expect(spyLogger).toHaveBeenCalledTimes(0);
    });

});
