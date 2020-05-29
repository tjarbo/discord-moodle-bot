import * as moodle from '../src/controllers/moodle/moodle'; 
import mockingoose from 'mockingoose';
import fetch from 'node-fetch';
import { ICourse } from '../src/controllers/moodle/course.interface';
import { ICourseDetails } from '../src/controllers/moodle/coursedetails.interface';
import { mocked } from 'ts-jest/utils';
import { loggerFile } from '../src/configuration/logger';
import { LastFetch } from '../src/controllers/moodle/lastfetch.schema';
import { IRessource } from '../src/controllers/moodle/ressource.interface';

jest.mock('node-fetch', () => jest.fn());
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
    })
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
        expect(spyLastFetchSave.mock.calls.length).toBe(0);
     })

    it ('should create a new timestamp and return the current date if this is the first fetch', async () => {
        mockingoose(LastFetch).toReturn(() => null, 'findOneAndUpdate');
        let currentTime = Math.floor(Date.now() / 1000);
        
        expect(await moodle.getLastFetch()).toBeGreaterThanOrEqual(currentTime);
        expect(spyLastFetchSave.mock.calls.length).toBe(1);
    })

});
/*
describe('fetchMoodleData', () => {
    let spyGetLastFetch: jest.SpyInstance;
    let spyFetchAssignments: jest.SpyInstance;
    let spyFetchRessources: jest.SpyInstance;
    let spyPrintNewAssignments: jest.SpyInstance;
    let spyPrintNewRessources: jest.SpyInstance;

    beforeEach(() => {
        spyGetLastFetch = jest.spyOn(moodle, 'getLastFetch');
        spyGetLastFetch.mockResolvedValue(123);

        let mockAssignments: ICourse[] = [{id: 0, assignments: []}, {id: 1, assignments: []}] as ICourse[];
        spyFetchAssignments = jest.spyOn(moodle, 'fetchAssignments');
        spyFetchAssignments.mockResolvedValue(mockAssignments);

        let mockRessources: IRessource[] = [{course: 0}, {course: 1}] as IRessource[];
        spyFetchRessources = jest.spyOn(moodle, 'fetchRessources');
        spyFetchRessources.mockResolvedValue(mockRessources);

        spyPrintNewAssignments = jest.spyOn(moodle, 'printNewAssignments');
        spyPrintNewRessources = jest.spyOn(moodle, 'printNewRessources');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should only print new Ressources and Assignments that aren´t blacklisted', async () => {
        let data = await moodle.fetchMoodleData();
        console.log(data);
        expect(spyFetchAssignments.mock.calls.length).toBe(1);
        expect(spyFetchRessources).toHaveBeenCalledTimes(1);
    })
});
*/
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

describe('printNewAssignments', () => {
    let spyLogger: jest.SpyInstance;
    let mockCourses: ICourse[];

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'debug');
        mockCourses = [
            { fullname: "Course01", assignments: [{ name: "As1", timemodified:  999 }] },
            { fullname: "Course02", assignments: [{ name: "As2", timemodified: 1001 }] }
        ] as ICourse[];
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

    it('should only print assignments newer than the last fetch timestamp', () => {
        moodle.printNewAssignments(mockCourses, 1000);
        expect(spyLogger).toBeCalledTimes(1);
    })
});

describe('printNewRessources', () => {
    let spyLogger: jest.SpyInstance;
    let spyFetchCourses: jest.SpyInstance;
    let mockRessources: IRessource[];

    beforeEach(() => {
        spyLogger = jest.spyOn(loggerFile, 'debug');
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
        await moodle.printNewRessources(mockRessources, '', 1000);
        expect(spyLogger).toBeCalledTimes(0);
    })
});
