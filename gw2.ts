import * as request from 'request';
import * as motdPull from './timedActions/motdPull';
import * as upgradesPull from './timedActions/upgradesPull';

let key: string;
let guildId: string;

const baseUrl = 'https://api.guildwars2.com/v2/';
const account = 'account';
const guild = 'guild/';
const items = 'items';
const members = '/members';
const upgrades = '/upgrades';
const log = '/log';
const treasury = '/treasury';

export function init(apiKey: string, guildNumber: number) {
	key = apiKey;
	getRequest(baseUrl + account).then((result: any) => {
		guildId = result.guilds[guildNumber];
		motdPull.start();
		upgradesPull.start();
		console.log('GW2 Initialized with guild id', guildId);
	}).catch((e) => {
		console.error('Could not fetch guild list!', e);
	})
}

function getRequest(originalUrl: string, getParams: string = '') {
	const urlStr = originalUrl + '?access_token=' + key + getParams;
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
export function getGuild() {
	return getRequest(baseUrl + guild + guildId);
}
export function getUpgrades() {
	return getRequest(baseUrl + guild + guildId + upgrades);
}
export function getTreasury() {
	return getRequest(baseUrl + guild + guildId + treasury);
}
export function getUpgradeList(ids = '') {
	if(ids) {
		ids = '&ids=' + ids
	}
	return getRequest(baseUrl + guild + upgrades, ids);
}
export function getItems(ids) {
	ids = '&ids=' + ids.join(',');
	return getRequest(baseUrl + items, ids);
}