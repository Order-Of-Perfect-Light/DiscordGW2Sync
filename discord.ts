import * as _ from 'lodash';
import {initTimers} from './timedActions';

const process: any = require('process');
const discord: any = require('discord.js');

import * as db from './db';
import {login} from './actions/login';
import {updatePermissions} from './actions/updatePermissions';
import {roll} from './actions/roll';

export const discordConnections = [
	new discord.Client()
];

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
		for(const i in discordConnections) {
			try {
				discordConnections[i].logout(() => {
					console.log('Done!');
					setTimeout(process.exit.bind(process), 1000);
				});
			} catch (e) { /* */ }
		}
		setTimeout(process.exit.bind(process), 1000);
	}
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

var initialize = true;

export function init(displayName: string, randomKey: string, email: string, password: string) {
	discordConnections[0].on('ready', function() {
		if(initialize) {
			initialize = false;
			discordConnections[0].user.setStatus('idle');

			officialChannel = _.filter(
				discordConnections[0].guilds.first().channels.array(),
				(c: any) => (
					c.name === 'official' &&
					c.type === 'text'
				)
			)[0];

			Promise.all([
				discordConnections[0].user.setUsername(displayName)
					.catch((e) => console.error('Set Username Fail!', e && e.stack || e)),
				discordConnections[0].user.setStatus('idle', 'Initializing....')
					.catch((e) => console.error('Set Status Fail!', e && e.stack || e))
			]).then(() => {
				initTimers();
				console.log('Discord init complete');
			});
		}
	});

	for(const i in discordConnections) {
		initBot(discordConnections[i], randomKey, displayName, email, password);
	}
}

const handledIds: string[] = [];

function initBot(bot: any, randomKey: string, displayName: string, email: string, password: string) {
	bot.on('message', function(message) {
		if(handledIds.indexOf(message.id) !== -1) {
			return;
		}
		handledIds.push(message.id);

		setTimeout(() => {
			var idx = handledIds.indexOf(message.id);
			if(idx != -1) {
				handledIds.splice(idx, 1);
			}
		}, 10000);

		var filtered: any[] = _.filter(message.mentions, (e: any) => e.username === displayName);
		if((!message.channel.name || filtered.length > 0) && message.author.username !== displayName) {
			console.log('Recieved message: ', message.content);
			var content = message.content;
			if(filtered.length > 0) {
				var content = content.replace('<@' + filtered[0].id + '>', '').trim();
			}
			if(content === 'help') {
				message.reply(
					'\nQuaggan understands these commands:\n' +
					'* login <Guildwars2 username with numbers> — logs youuuUUUuuu into the system\n' +
					'* updatePermissions — updates discord permissions for youuuUUUuuu\n' +
					'* roll <number> <sides> <sort> — Roll a number of dice (uses random.org). The last argument should be either true or false, defaults to true'
				);
			} else if (content.startsWith('login ')) {
				login(bot, message, content);
			} else if (content === 'updatePermissions') {
				updatePermissions(bot, message, content);
			} else if (content.startsWith('roll ')) {
				roll(bot, message, content, randomKey);
			} else {
				message.reply('Quaggan does not understand.... CoooOOOOoooooo');
			}
		}
	});

	bot.on('warn', function(message) {
		console.log('warning recieved', message);
	});

	bot.on('error', function(message) {
		console.log('error recieved', message);
	});

	bot.on('disconnected', function(m) {
		console.log('disconnected!', m);
	});

	bot.on('connected', function(m) {
		console.log('connected!', m);
	});

	bot.login(email, password)
		.then(
			() => console.log('Done!'),
			(e) => console.error('Login Fail!', e && e.stack || e)
		);
}

export function processGw2Members(bot: any, members) {
	var ranks = _(members).map('rank').sort().uniq().value();
	ranks.push('Verified');
	var server = bot.guilds.first();
	console.log('Getting users');
	return db.get('SELECT gw2User, discordUser FROM userList', []).then((rows) => {
		console.log('User List: ', rows);
		var currentPromise = Promise.resolve({});
		for(var i in rows) {
			const gw2User: any[] = _.filter(members, (m: any) => m.name === rows[i].gw2User);
			if (gw2User.length > 0) {
				console.log('Gw2User:', gw2User);
				const member = server.member(rows[i].discordUser);
				const userRoles = member.roles.array();
				const addRole = _.filter(server.roles, (r: any) => r.name === gw2User[0].rank);
				const verifiedRole = _.filter(server.roles, (r: any) => r.name === 'Verified');

				const discordId = rows[i].discordUser;
				const rank = gw2User[0].rank;

				for (const j in userRoles) {
					if (
						_.includes(ranks, userRoles[j].name) && userRoles[j].name !== rank &&
						(userRoles[j].name !== 'Verified' || !rank)
					) {
						const roleName = userRoles[j].name;
						console.log('Removing', roleName, 'from', discordId);
						delete userRoles[j];
					}
				}

				if(rank) {
					console.log('Adding', rank, 'to', discordId, 'for', gw2User);
					userRoles.push(addRole);
				}

				currentPromise = currentPromise.then(() => {
					console.log('Saving roles for ', discordId, '/', gw2User);
					return server.member(rows[i].discordUser).setRoles(member);
				});
			}
		}
	});
}

export function getMessage(bot, title) {
	var server = bot.guilds.first();

	return officialChannel.fetchMessages().then((messages: any) => {
		const resultMessage: any = _.filter(messages.array(), (m: any) => m.content.startsWith('**' + title + '**'));
		if(resultMessage.length > 0) {
			return resultMessage[0];
		} else {
			return Promise.reject('Failed to find MOTD');
		}
	});
}