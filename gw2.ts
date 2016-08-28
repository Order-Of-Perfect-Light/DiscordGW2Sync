import * as request from 'request';

let key: string;
let guildId: string;

const baseUrl = 'https://api.guildwars2.com/v2/';
const account = 'account';
const guild = 'guild/';
const members = '/members';
const log = '/log';

export function init(apiKey: string, guildNumber: number) {
	key = apiKey;
	getRequest(baseUrl + account).then((result: any) => {
		guildId = result.guilds[guildNumber];
		console.log('GW2 Initialized with guild id', guildId)
	}).catch((e) => {
		console.error('Could not fetch guild list!', e);
	})
}

function getRequest(originalUrl: string) {
	const urlStr = originalUrl + '?access_token=' + key;
	console.log('Fetching', urlStr);
	return new Promise((resolve, reject) => {
		var req = request({
			url: urlStr,
			timeout: 5000
		}, (error, response, body: string) => {
			if(error) {
				if(error.code === 'ETIMEDOUT') {
					return getRequest(originalUrl);
				}
				reject(error);
			} else {
				try {
					console.log('Result (first 100 chars)', body.substr(0, 100));
					resolve(JSON.parse(body));
				} catch(e) {
					reject(e);
				}
			}
		});
	});
}

export function getMembers() {
	return getRequest(baseUrl + guild + guildId + members);
}
export function getLog() {
	return getRequest(baseUrl + guild + guildId + log);
}