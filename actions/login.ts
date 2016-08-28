import * as _ from 'lodash';

import * as db from '../db';
import * as gw2 from '../gw2';
import * as discord from '../discord';

export function login(message, content) {
	var gw2User = content.replace(/^login /, '');
	gw2.getMembers().then((memberList) => {
		var user = _.filter(memberList, (item) => item.name === gw2User);
		if(user.length !== 1) {
			discord.bot.reply(message, 'Quaggan doesn\'t recognize youuuUUUuuu');
		} else {
			var copper = Math.floor(Math.random() * 50);
			discord.bot.reply(message, 'Quaggan thinks that youuuUUUuuu should deposit ' + copper + ' copper coins to the guild stash soooOOOoooon');
			return waitForCopper(gw2User, copper)
				.then(() => db.get('SELECT id FROM userList WHERE discordUser = ?', [message.author.id]))
				.then((rows) => {
					if (rows.length == 0) {
						return db.run('INSERT INTO userList (discordUser, gw2User) VALUES (?, ?)', [message.author.id, gw2User])
					} else {
						return db.run('UPDATE userList SET gw2User = ? WHERE id = ?', [gw2User, rows[0].id])
					}
				}).then(() => {
					discord.processGw2Members(memberList);
					discord.bot.reply(message, 'YouuuUUUuuu are logged in!');
				});
		}
	}).catch((err) => {
		discord.bot.reply(message, 'Quaggan could not log youuuUUUuuu in. Quaggan is sorry!');
		console.log('Failed to login!', {
			discordId: message.author.id,
			gw2User: gw2User,
			error: err
		})
	})
}

function waitForCopper(gw2User, copper, startDate = (new Date()), count = 0, maxLoops = 60 * 5) {
	return gw2.getLog().then((data) => {
		data = _.filter(data, (o) => (
			o.type === 'stash' &&
			o.operation === 'deposit' &&
			o.user === gw2User &&
			o.item_id === 0 &&
			o.count === 0 &&
			o.coins === copper &&
			new Date(o.time) > startDate
		));
		if(data.length === 0) {
			if(count < maxLoops) {
				return new Promise((resolve, reject) => {
					setTimeout(() => waitForCopper(gw2User, copper, startDate, count).then(resolve, reject), 1000);
				});
			} else {
				return Promise.reject('Took too long to deposit copper');
			}
		}
	})
}