import * as moodle from '../src/controllers/moodle/moodle'; 
import mockingoose from 'mockingoose';
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import { ICourse } from '../src/controllers/moodle/course.interface';
import { IRessource } from '../src/controllers/moodle/ressource.interface';
import { loggerFile } from '../src/configuration/logger';
import { LastFetch } from '../src/controllers/moodle/lastfetch.schema';

jest.mock('node-fetch', () => {
    return jest.fn();
  });
  
 /* beforeEach(() => {
    mocked(fetch).mockClear();
  });*/

jest.mock('../src/configuration/environment', () => ({
    config: {
        moodle: {
            baseURL: "https://moodle.example.com",
            token:   "MOODLETOKEN123",
        },
    },
}));

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

    it('should return an array of all courses containing the assignments provided by the moodle API', async () => {
        mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.resolve({
            json: () => ({courses: []})
        }))
        expect(await moodle.fetchAssignments(null)).toStrictEqual([]);
    })

    it('should throw an error if the request fails', async () => {
        mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.reject());
        await moodle.fetchAssignments(null);
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

    it('should return an array of all ressources provided by the moodle API', async () => {
        mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.resolve({
            json: () => ({resources: []})
        }));
        expect(await moodle.fetchRessources(null)).toStrictEqual([]);
    })

    it('should throw an error if the request fails', async () => {
        mocked(fetch).mockImplementationOnce((): Promise<any> => Promise.reject());
        await moodle.fetchRessources(null);
        expect(spyLogger).toHaveBeenCalledTimes(1);
    })
});

describe('fetchEnrolledCourses', () => {
    it('should return an array of all ressources provided by the moodle API', () => {
        
    })

    it('should throw an error if the request fails', () => {

    })            
});

describe('printNewAssignments', () => {
    it('should only print assignments newer than the last fetch timestamp', () => {
        
    })
});

describe('printNewRessources', () => {
    it('should only print ressources newer than the last fetch timestamp', () => {
        
    })        
});
