
const usernameInput = document.getElementById('username');
const moodleURLInput = document.getElementById('moodleurl');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const form = document.getElementById('form');
const modal = document.getElementById('modal');

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
 * Sends a request to the submitted moodle service to
 * request a token to access the api passwordless
 * 
 * @returns {Promise} Request
 */
function requestToken() {

    const url = [
        moodleURLInput.value,
        '/login/token.php',
        '?username=',
        usernameInput.value,
        '&password=',
        passwordInput.value,
        '&service=moodle_mobile_app'
    ].join('')


    return fetch(url).then(response => response.json())
}

/**
 * Sends a request to the moodle service to get basic information about the moodle service
 * and the user
 * 
 * @param {string} token Token from successful requestToken()
 * @returns {Promise} Request
 */
function requestPersonalId(token) {
    
    const url = [
        moodleURLInput.value,
        '/webservice/rest/server.php',
        '?wsfunction=core_webservice_get_site_info',
        '&wstoken=',
        token,
        '&moodlewsrestformat=json'
    ].join('')


    return fetch(url).then(response => response.json())
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
function showResult(firstname, university, moodlebaseurl ,token, userid) {
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
    document.getElementById('close').onclick = () => { modal.classList.remove('is-active'); }
}


/**
 * Main function to handle and manage the token and environment variables.
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
        let response = await requestToken()
        
        if ('token' in response) { token = response.token }
        else if ('error' in response) { throw Error(response.error) }
        else { throw new Error('Unexpected server response') }

        response = await requestPersonalId(token);
        console.log(response);
        if ('userid' in response) { 
            firstname  = response.firstname;
            university = response.sitename;
            userid     = response.userid;
            moodlebaseurl = response.siteurl;
        }
        else if ('errorcode' in response) { throw new Error(response.message) }
        else { throw new Error('Unexpected server response') }
        
        showResult(firstname, university, moodlebaseurl, token, userid);

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setLoading(false);
    }

}

document.getElementById('form').onsubmit = onSubmit;
