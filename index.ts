/// <reference path="node_modules/@types/es6-promise/index.d.ts"/>
import * as yargs from 'yargs';
import * as _ from 'lodash';
import * as path from 'path';

import * as db from './db';
import * as gw2 from './gw2';
import * as discord from './discord';

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
discord.init(args.displayName, args.randomKey, args.email, args.password);
