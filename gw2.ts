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
	}).catch((e) => {
		console.error('Could not fetch guild list!', e);
	})
}

function getRequest(urlStr: string) {
	urlStr += '?access_token=' + key;
	return new Promise((resolve, reject) => {
		var req = request(urlStr, (error, response, body) => {
			if(error) {
				reject(error);
			} else {
				try {
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