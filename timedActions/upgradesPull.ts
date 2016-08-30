import * as _ from 'lodash';

import * as gw2 from '../gw2';
import * as discord from '../discord';

let upgradesMessage: any;
let upgradesList: Promise<any>;
let items: any = {};

const title = 'Guild Hall Upgrades';

let startCount = 0;

function rightPad(str, pad, len) {
	while (pad.length < len) {
		pad += pad;
	}
	return str + pad.substr(0, len - str.length);
}
function leftPad(str, pad, len) {
	while (pad.length < len) {
		pad += pad;
	}
	return pad.substr(0, len - str.length) + str;
}

export function start() {
	startCount++;
	if (startCount === 2) {
		discord.getMessage(title).then((channel: any) => {
			upgradesMessage = channel;
			run();
			setInterval(run, 1000 * 60 * 60);
		}).catch((e) => console.error('Failed to find ' + title, e));
		/*upgradesList = gw2.getUpgradeList().then((data: number[]) => {
		 const promises: Promise<any[]>[] = [];
		 const batchSize = Math.ceil(data.length / 6);
		 for (var i = 0; i < data.length; i += batchSize) {
		 promises.push(gw2.getUpgradeList(data.splice(i, batchSize).join(',')));
		 }
		 return Promise.all(promises).then((results: any[][]) => {
		 const list = [].concat(results);
		 const retVal = {};
		 for(var i in list) {
		 retVal[list[i].id] = retVal;
		 }
		 });
		 });*/
	}
}

function run() {
	getTreasuryInfo().then((treasury) => {
		var needs: string[] = [];

		for(var i in treasury) {
			const count = treasury[i].count;
			const need = _(treasury[i].needed_by).map("count").sum();

			if(need > count) {
				needs.push(
					rightPad(
						items[treasury[i].item_id].name,
						' ',
						30
					) +
					leftPad(
						count.toString(),
						' ',
						4
					) + '/' +
					leftPad(
						need.toString(),
						' ',
						4,
					) + ' (' +
					leftPad(
						(Math.floor((count/need) * 1000)/10).toFixed(1),
						' ',
						4
					) + '%)');
			}
		}

		upgradesMessage.update(
			'**' + title + '**\n' +
			'__Needed items for guild hall upgrades__\n```' +
			needs.join('\n') + '```\n' +
			'Last Update: ' + (new Date().toISOString()),
			{tts: false},
			(err) => {
				if(err) {
					console.error('Failed to update ' + title + '. Reason: ', err && err.stack || err);
				}
			}
		);
	}).catch((e) => console.error('Failed to pull upgrades list', e && e.stack || e));
}

function getTreasuryInfo(): Promise<any[]> {
	return gw2.getTreasury().then((treasury: any[]) => {
		var itemIds = _(treasury).map('item_id').sort().uniq().filter((i: string) => !items[i]).value();

		return gw2.getItems(itemIds).then((fetchedItems) => {
			for(var i in fetchedItems) {
				items[fetchedItems[i].id] = fetchedItems[i];
			}
		}).then(() => treasury);
	})
}