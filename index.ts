/// <reference path="node_modules/@types/es6-promise/index.d.ts"/>
import * as yargs from 'yargs';
import * as _ from 'lodash';
import * as path from 'path';

import * as db from './db';
import * as gw2 from './gw2';
import * as discord from './discord';
import {login} from './actions/login';
import {updatePermissions} from './actions/updatePermissions';
import {roll} from './actions/roll';

var args: {
	email: string,
	password: string,
	apiKey: string,
	displayName: string,
	dataDirectory: string,
	guildNumber: number,
	randomKey: string
} = yargs.options({
	email: {
		describe: 'The discord email',
		type: 'string',
		required: true
	},
	password: {
		describe: 'The discord password',
		type: 'string',
		required: true
	},
	displayName: {
		describe: 'The display name for the bot',
		type: 'string',
		default: 'Robotic Quaggan'
	},
	apiKey: {
		describe: 'The gw2 api key',
		type: 'string',
		required: true
	},
	guildNumber: {
		describe: 'The number of the targeted guild in the guilds list',
		type: 'number',
		required: true
	},
	randomKey: {
		describe: 'The api key for random.org',
		type: 'string',
		required: true
	},
	dataDirectory: {
		describe: 'The directory to store stuff in',
		type: 'string',
		default: path.join(__dirname, 'data')
	}
}).env('').argv;

db.init(args.dataDirectory);
gw2.init(args.apiKey, args.guildNumber);
discord.init(args.displayName);

discord.bot.on('message', function(message) {
	var filtered: any[] = _.filter(message.mentions, (e: any) => e.username === args.displayName);
	if((!message.channel.name || filtered.length > 0) && message.author.username !== args.displayName) {
		console.log('Recieved message: ', message.content);
		var content = message.content;
		if(filtered.length > 0) {
			var content = content.replace('<@' + filtered[0].id + '>', '').trim();
		}
		if(content === 'help') {
			discord.bot.reply(
				message,
				'\nQuaggan understands these commands:\n' +
				'* login <Guildwars2 username with numbers> — logs youuuUUUuuu into the system\n' +
				'* updatePermissions — updates discord permissions for youuuUUUuuu\n' +
				'* roll <number> <sides> <sort> — Roll a number of dice (uses random.org). The last argument should be either true or false, defaults to true'
			);
		} else if (content.startsWith('login ')) {
			login(message, content);
		} else if (content === 'updatePermissions') {
			updatePermissions(message, content);
		} else if (content.startsWith('roll ')) {
			roll(message, content, args.randomKey);
		} else {
			discord.bot.reply(message, 'Quaggan does not understand.... CoooOOOOoooooo');
		}
	}
});

discord.bot.on('warn', function(message) {
	console.log('warning recieved', message);
});

discord.bot.on('error', function(message) {
	console.log('error recieved', message);
});

discord.bot.on('disconnected', function(m) {
	console.log('disconnected!', m);
});

discord.bot.on('connected', function(m) {
	console.log('connected!', m);
});

console.log('Logging In...');
discord.bot.login(args.email, args.password)
	.then(
		() => console.log('Done!'),
		(e) => console.error('Login Fail!', e && e.stack || e)
	);