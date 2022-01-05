
const usernameInput  = document.getElementById('username');
const moodleURLInput = document.getElementById('moodleurl');
const passwordInput  = document.getElementById('password');
const submitButton   = document.getElementById('submit');
const form           = document.getElementById('form');
const modal          = document.getElementById('modal');
const errorMessage   = document.getElementById('errormessage');

/**
 * Enable or disable input fields
 * @param {boolean} on  
 */
function setLoading(on) {
    usernameInput.disabled = on;
    moodleURLInput.disabled = on;
    passwordInput.disabled = on;
    submitButton.disabled = on;

    if (on) {
        submitButton.classList.add('is-loading')
    } else {
        submitButton.classList.remove('is-loading')
    }
}

/**
 * Send a request to the url and returns it as a object.
 *
 * @param {string} url request url
 * @return {Promise} JSON-Object
 */
function requestJSON(url) {
    return fetch(url).then(response => response.json()) ;   
}

/**
 * Activates the modal to present the results
 * 
 * @param {string} firstname Firstname of the user 
 * @param {string} university Institute behind the moodle instance
 * @param {string} moodlebaseurl URL to access the moodle instance
 * @param {string} token Token to use the moodle api
 * @param {string} userid Userid of the user
 */
function showResult(firstname, university, moodlebaseurl, token, userid) {
    const firstnameSpan     = document.getElementById('firstname');
    const universitySpan    = document.getElementById('university');
    const tokenSpan         = document.getElementById('token');
    const useridSpan        = document.getElementById('userid');
    const moodlebaseurlSpan = document.getElementById('moodlebaseurl');
    
    firstnameSpan.innerText     = firstname;
    universitySpan.innerText    = university;
    tokenSpan.innerText         = token;
    useridSpan.innerText        = userid;
    moodlebaseurlSpan.innerText = moodlebaseurl;

    modal.classList.add('is-active');
    document.getElementById('close').onclick = () => { 
        modal.classList.remove('is-active'); 
        errorMessage.classList.add('is-hidden');
    }
}

/**
 * Displays the error message
 *
 * @param {*} text Description
 * @param {*} response Response from the api
 * @param {*} url Url that has been requested
 */
function showApiError(text, response, url) {
    const errorTextSpan     = document.getElementById('errortext');
    const errorRequestSpan  = document.getElementById('errorrequest');
    const errorResponseSpan = document.getElementById('errorresponse');

    errorTextSpan.innerText     = text;
    errorRequestSpan.innerText  = url;
    errorResponseSpan.innerText = response;

    errorMessage.classList.remove('is-hidden');
}

/**
 * Performs a demo request to check, if the moodle-api is reachable and
 * works.
 *
 * @param {*} moodlebaseurl URL to access the moodle instance
 * @param {*} token Token to use the moodle api
 * @param {*} userid Userid of the user
 */
async function checkApi(moodlebaseurl, token, userid) {
    const url = [
        moodlebaseurl,
        '/webservice/rest/server.php',
        '?wsfunction=core_enrol_get_users_courses',
        '&userid=',
        userid,
        '&wstoken=',
        token,
        '&moodlewsrestformat=json'
    ].join('');

    console.info("Überprüfe Moodle-API funktionalität", url);

    try {
        let response = await requestJSON(url);
        console.log("** Antwort", response)
        
        // Something went wrong -> received moodle error
        if ('errorcode' in response) {

            const text = `Beim Überprüfen der Moodle Schnittstellen ist ein Fehler aufgetreten. Dann kann verschiedene Gründe haben,
            eventuell können dir dabei aber nur die Administratoren deiner Moodle-Platform weiterhelfen. Details
            zu der Fehlermeldung findest du unten. Leider kann der Bot ohne diese Schnittstelle nicht korrekt
            funktionieren.
            `;

            showApiError(text, JSON.stringify(response), url);
        }

    } catch (error) {
        console.error("** error", error);
        // two cases: HttpError -> MoodleError
        const text = `Beim Überprüfen der Moodle Schnittstellen ist ein Fehler aufgetreten. Das kann entweder an einer
        veralteten Moodle-Instanz liegen, da die Schnittstelle dort nicht verfügbar ist oder es gab ein Problem mit deiner
        Internet Verbindung - versuche es nochmal!`;
        showApiError(text, error.message, url);
    }
}

/**
 * Main function to handle and manage the token and environment variables.
 * 
 * Sends a request to the submitted moodle service to
 * request a token to access the api passwordless
 * 
 * Sends a request to the moodle service to get basic information about the moodle service
 * and the user
 * 
 * @param {Event} event 
 */
async function onSubmit(event) {
    let token         = 'N/A';
    let firstname     = 'user';
    let university    = '';
    let userid        = 'N/A';
    let moodlebaseurl = 'N/A';

    event.preventDefault();

    setLoading(true);

    try {
        const urlToken = [
            moodleURLInput.value,
            '/login/token.php',
            '?username=',
            encodeURIComponent(usernameInput.value),
            '&password=',
            encodeURIComponent(passwordInput.value),
            '&service=moodle_mobile_app'
        ].join('');

        let response = await requestJSON(urlToken);
        
        if ('token' in response) { token = response.token }
        else if ('error' in response) { throw Error(response.error) }
        else { throw new Error('Unexpected server response') }

        const urlPersonalId = [
            moodleURLInput.value,
            '/webservice/rest/server.php',
            '?wsfunction=core_webservice_get_site_info',
            '&wstoken=',
            token,
            '&moodlewsrestformat=json'
        ].join('');

        response = await requestJSON(urlPersonalId);
        console.log(response);
        if ('userid' in response) { 
            firstname     = response.firstname;
            university    = response.sitename;
            userid        = response.userid;
            moodlebaseurl = response.siteurl;
        }
        else if ('errorcode' in response) { throw new Error(response.message) }
        else { throw new Error('Unexpected server response') }
        
        showResult(firstname, university, moodlebaseurl, token, userid);
        checkApi(moodlebaseurl, token, userid);

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setLoading(false);
    }

}

document.getElementById('form').onsubmit = onSubmit;
