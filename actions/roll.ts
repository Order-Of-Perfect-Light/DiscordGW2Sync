const RandomOrg = require('random-org');
import * as _ from 'lodash';

var random;

function sortNumber(a,b) {
	return a - b;
}

export function roll(bot: any, message, content, randomKey) {
	if(!random) {
		random = new RandomOrg({ apiKey: randomKey });
	}
	var data = content.replace(/^roll /, '').split(' ');
	random.generateIntegers({ min: 1, max: data[1], n: data[0] })
		.then(function(result) {
			if(data[2] !== "false") {
				var rollData = _.groupBy(result.random.data.sort(sortNumber));
				var final: string[] = [];
				for(var i in rollData) {
					if(rollData[i].length === 1) {
						final.push(i);
					} else {
						final.push(i + 'x' + rollData[i].length);
					}
				}
				bot.reply(message, final.join(', '));
			} else {
				bot.reply(message, result.random.data.join(', '));
			}
		})
		.catch((e) => {
			console.error('Failed to roll numbers', e);
			bot.reply(message, 'Quaggan failed, Quaggan is sorry!');
		});
}