import * as moodle from '../src/controllers/moodle/moodle'; 

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
    it('should return the timestamp of the last fetch stored in mongodb', () => {

    })

    it ('should create a new timestamp and return the current date if this is the first fetch', () => {

    })
});

describe('fetchMoodleData', () => {
    it('Only print new Assignments that aren´t blacklisted', () => {
        
    })
    
    it('Only print new Ressources that aren´t blacklisted', () => {
        
    })
});

describe('fetchAssignments', () => {
    it('should return an array of all courses containing the assignments provided by the moodle API', () => {
        
    })

    it('should throw an error if the request fails', () => {

    })
});

describe('fetchRessources', () => {
    it('should return an array of all ressources provided by the moodle API', () => {
        
    })

    it('should throw an error if the request fails', () => {

    })      
});

describe('fetchEnroledCourses', () => {
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
