import * as moodle from '../src/controllers/moodle/fetch';
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import { loggerFile } from '../src/configuration/logger';

jest.mock('node-fetch', () => jest.fn());

const mockFetch = (res: any) =>
    mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.resolve({
        json: () => res,
    }));

//function mockFetch(res: any) { return mocked(fetch).mockResolvedValue({json: () => res} as fetch.Response)};

const mockFailedFetch = () =>
    mocked(fetch).mockImplementationOnce(() => Promise.reject());

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
