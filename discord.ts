import * as _ from 'lodash';
import * as process from 'process';
import * as discord from 'discord.js';

import * as db from './db';

export const bot = new discord.Client();
let server;

var logout = true;
function exitHandler(options, err) {
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

export function init(displayName: string) {
	bot.on('ready', function() {
		bot.setUsername(displayName)
			.catch((e) => console.error('Set Username Fail!', e && e.stack || e));
		bot.setPlayingGame('CoooOOOooOOOoo Beep Boop CoooooOOOOoooOOOoo')
			.catch((e) => console.error('Set Playing Fail!', e && e.stack || e));
		bot.setStatusIdle()
			.catch((e) => console.error('Set Idle Fail!', e && e.stack || e));
	});
}

export function processGw2Members(members) {
	var ranks = _(members).map('rank').sort().uniq().value();
	var server = bot.servers[0];
	return db.get('SELECT gw2User, discordUser FROM userList', []).then((rows) => {
		for(var i in rows) {
			var gw2User = _.filter(members, (m) => m.name === rows[i].gw2User);
			if (gw2User.length > 0) {
				var userRoles = server.rolesOfUser(rows[i].discordUser);
				var addRole = _.filter(server.roles, (r) => r.name === gw2User[0].rank);

				const discordId = rows[i].discordUser;
				const rank = gw2User[0].rank;

				for (var j in userRoles) {
					console.log('here', gw2User.name, userRoles[j].name, rank, ranks, _.includes(ranks, userRoles[j].name), userRoles[j].name !== rank)
					if (_.includes(ranks, userRoles[j].name) && userRoles[j].name !== rank) {
						console.log('removing')
						var roleName = userRoles[j].name;
						bot.removeMemberFromRole(rows[i].discordUser, userRoles[j], (err) => {
							if(err && err.response.statusCode) {
								console.error('Failed to remove', discordId , 'from', roleName, err.response.text);
							}
						});
					}
				}

				bot.addMemberToRole(rows[i].discordUser, addRole, (err) => {
					if(err && err.response.statusCode) {
						console.error('Failed to add', discordId , 'to', rank, err.response.text);
					}
				});
			}
		}
	});
}