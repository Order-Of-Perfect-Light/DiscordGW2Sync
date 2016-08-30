import * as gw2 from '../gw2';
import * as discord from '../discord';

export function updatePermissions(bot: any, message, content) {
	gw2.getMembers().then((memberList) => {
		return discord.processGw2Members(bot, memberList);
	}).catch((e) => console.error('Failed to update permissions', e && e.stack || e))
}