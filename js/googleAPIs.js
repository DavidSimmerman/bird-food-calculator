import * as G from './G.js';
import { generatePromise, getCookie, loadScript, setCookie } from './utils.js';

const CLIENT_ID = '905862553602-o2qfn27n9eijlpcljp0rt7rog3gnrba8.apps.googleusercontent.com';
// restricted to https://davidsimmerman.github.io/bird-food-calculator/
const API_KEY = 'AIzaSyBRjwP9wnoS7j4WCp6mJAOewWDreY4wu_A';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
let tokenClient;
let isSignedIn = false;
let initPromise = generatePromise();
let signInPromise = generatePromise();

// Init google libraries
Promise.all([loadScript('https://apis.google.com/js/api.js'), loadScript('https://accounts.google.com/gsi/client')]).then(
	async () => {
		await new Promise(res => {
			gapi.load('client', async () => {
				await gapi.client.init({
					apiKey: API_KEY,
					discoveryDocs: [DISCOVERY_DOC]
				});
				res();
			});
		});

		tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: SCOPES,
			callback: '' // defined later
		});

		initPromise.resolve();
		G.onGlibLoad();
		console.log('glib initialized');
	}
);

waitForInit().then(maybeSignInToken);

export function waitForInit() {
	return initPromise.promise;
}

export function waitForSignIn() {
	return signInPromise.promise;
}

export async function signIn() {
	await waitForInit();

	maybeSignInToken();
	if (isSignedIn) return signInPromise.promise;

	tokenClient.callback = async resp => {
		if (resp.error !== undefined) signInPromise.reject(resp);
		else {
			setCookie('bird_gapi_token', JSON.stringify(resp), 59);
			setCookie('bird_gapi_has_signed_in', 'true', 60 * 24 * 7);
			isSignedIn = true;
			signInPromise.resolve();
		}
	};

	if (getCookie('bird_gapi_has_signed_in') !== 'true') tokenClient.requestAccessToken({ prompt: 'consent' });
	else tokenClient.requestAccessToken({ prompt: '' });
	return signInPromise.promise;
}

export async function getG() {
	await waitForSignIn();
	return G;
}

function maybeSignInToken() {
	if (isSignedIn) return;

	const token = getCookie('bird_gapi_token');
	if (!token) return;

	gapi.client.setToken(JSON.parse(token));
	isSignedIn = true;
	signInPromise.resolve();
}
