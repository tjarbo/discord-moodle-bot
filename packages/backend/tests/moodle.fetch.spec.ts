import * as moodle from '../src/controllers/moodle/fetch';
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import { loggerFile } from '../src/configuration/logger';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../src/configuration/environment.ts');
jest.mock('../src/configuration/discord.ts');
jest.mock('../src/controllers/discord/index.ts');


const mockFetch = (res: any) =>
    mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.resolve({
        json: () => res,
    }));

describe('fetchAssignments', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should address the correct moodle wsfunction', async () => {
        mockFetch([]);
        await moodle.fetchAssignments('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=mod_assign_get_assignments');
    });

    it('should return an array of all courses containing the assignments provided by the moodle API', async () => {
        mockFetch({ courses: [] });
        expect(await moodle.fetchAssignments('')).toStrictEqual([]);
    });
});

describe('fetchResources', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should address the correct moodle wsfunction', async () => {
        mockFetch([]);
        await moodle.fetchResources('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=mod_resource_get_resources_by_courses');
    });

    it('should return an array of all resources provided by the moodle API', async () => {
        mockFetch({ resources: [] });
        expect(await moodle.fetchResources('')).toStrictEqual([]);
    });
});

describe('fetchEnrolledCourses', () => {
    let spyLogger: jest.SpyInstance;

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'error');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should address the correct moodle wsfunction', async () => {
        mockFetch([]);
        await moodle.fetchEnrolledCourses('');
        expect(mocked(fetch)).toHaveBeenCalledWith('&wsfunction=core_enrol_get_users_courses&userid=123456');
    });

    it('should return an array of all resources provided by the moodle API', async () => {
        mockFetch([]);
        expect(await moodle.fetchEnrolledCourses('')).toStrictEqual([]);
    });
});
