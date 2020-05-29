import * as moodle from '../src/controllers/moodle/';
import mockingoose from 'mockingoose';
import { LastFetch } from '../src/controllers/moodle/schemas/lastfetch.schema';

//jest.mock('../src/controllers/discord', () => jest.fn());
jest.mock('../src/configuration/environment');

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
