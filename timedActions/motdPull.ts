import * as gw2 from '../gw2';
import * as discord from '../discord';

let motdMessage: any;

const title = 'GW2 MOTD';


export function start() {
	discord.getMessage(discord.discordConnections[0], title).then((channel: any) => {
		motdMessage = channel;
		run();
		setInterval(run, 1000 * 60 * 60);
	}).catch((e) => console.error('Failed to find MOTD', e && e.stack || e));
}

function run() {
	gw2.getGuild().then((data: any) => {
		motdMessage.edit('**' + title + '**\n' + data.motd, {tts: false}, (err) => {
			if(err) {
				console.error('Failed to update MOTD. Reason: ', err && err.stack || err);
			}
		});
		//console.log(data.motd, motdChannel);
	})
}