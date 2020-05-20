import fetch from 'node-fetch';
import { loggerFile } from '../../configuration/logger';
import { config } from '../../configuration/environment';

/**
 * Fetches all the data from the Moodle webservice
 *
 * @export
 */
export function fetchMoodleData() {
    const token = config.moodle.token;
    const moodleUrl = config.moodle.baseURL
                    + '/webservice/rest/server.php'
                    + '?wstoken=' + token
                    + '&moodlewsrestformat=json';

    fetchAssignments(moodleUrl);
    fetchRessources(moodleUrl);


    //TODO: Recursively call Method with given timeout.
    //mind the recursion loop!!!
}

function fetchAssignments(moodleUrl: string) {
    loggerFile.debug('connecting to '+moodleUrl);
    fetch(moodleUrl + '&wsfunction=mod_assign_get_assignments')
	  .then(res => res.json())
      .then(json => loggerFile.debug(json)
    ).catch((error) => {
        loggerFile.error('Moodle API request failed', error);
      });
}

function fetchRessources(moodleUrl: string) {
    loggerFile.debug('This method has also been called ;)');
}