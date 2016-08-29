import * as _ from 'lodash';
import * as motdPull from './timedActions/motdPull';
import * as upgradesPull from './timedActions/upgradesPull';

const process: any = require('process');
const discord: any = require('discord.js');

import * as db from './db';

export const bot = new discord.Client();

let officialChannel;
let server;

var logout = true;
function exitHandler(options, err) {
	if(err) {
		console.error('Aborting due to an uncaught exception!', err.stack || err);
	}
	if(logout) {
		logout = false;
		console.log('Logging out');
		bot.logout(() => {
			console.log('Done!');
			process.exit();
		});
	}
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

var initialize = true;

export function init(displayName: string) {
	bot.on('ready', function() {
		if(initialize) {
			initialize = false;
			bot.setStatusIdle();

			officialChannel = _.filter(bot.servers[0].channels, (c: any) => (
				c.name === 'official' &&
				c.type === 'text'
			))[0];

			motdPull.start();
			upgradesPull.start();

			Promise.all([
				bot.setUsername(displayName)
					.catch((e) => console.error('Set Username Fail!', e && e.stack || e)),
				bot.setPlayingGame('CoooOOOooOOOoo Beep Boop CoooooOOOOoooOOOoo')
					.catch((e) => console.error('Set Playing Fail!', e && e.stack || e))
			]).then(() =>
				bot.setStatusActive()
					.catch((e) => console.error('Set Active Fail!', e && e.stack || e))
			).then(() => {
				console.log('Discord init complete')
			});
		}
	});
}

export function processGw2Members(members) {
	var ranks = _(members).map('rank').sort().uniq().value();
	ranks.push('Verified');
	var server = bot.servers[0];
	return db.get('SELECT gw2User, discordUser FROM userList', []).then((rows) => {
		for(var i in rows) {
			var gw2User: any[] = _.filter(members, (m: any) => m.name === rows[i].gw2User);
			if (gw2User.length > 0) {
				var userRoles = server.rolesOfUser(rows[i].discordUser);
				var addRole = _.filter(server.roles, (r: any) => r.name === gw2User[0].rank);
				var verifiedRole = _.filter(server.roles, (r: any) => r.name === 'Verified');

				const discordId = rows[i].discordUser;
				const rank = gw2User[0].rank;

				for (var j in userRoles) {
					if (
						_.includes(ranks, userRoles[j].name) && userRoles[j].name !== rank &&
						(userRoles[j].name !== 'Verified' || !rank)
					) {
						var roleName = userRoles[j].name;
						console.log('Removing', roleName, 'from', discordId);
						bot.removeMemberFromRole(rows[i].discordUser, userRoles[j], (err) => {
							if(err && err.response.statusCode) {
								console.error('Failed to remove', discordId , 'from', roleName, err.response.text);
							}
						});
					}
				}

				if(rank) {
					console.log('Adding', rank, 'to', discordId);
					bot.addMemberToRole(rows[i].discordUser, addRole, (err) => {
						if (err && err.response.statusCode) {
							console.error('Failed to add', discordId, 'to', rank, err.response.text);
						}
						console.log('Adding verified to', discordId);
						bot.addMemberToRole(rows[i].discordUser, verifiedRole, (err) => {
							if (err && err.response.statusCode) {
								console.error('Failed to add', discordId, 'to verified', err.response.text);
							}
						});
					});
				}
			}
		}
	});
}

export function getMessage(title) {
	return officialChannel.getLogs().then((messages: any) => {
		const resultMessage = _.filter(messages, (m: any) => m.content.startsWith('**' + title + '**'))
		if(resultMessage.length > 0) {
			return resultMessage[0];
		} else {
			return Promise.reject('Failed to find MOTD');
		}
	});
}