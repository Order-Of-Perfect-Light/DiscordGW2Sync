import {discordConnections} from '../discord';
import * as motdPull from './motdPull';
import * as upgradesPull from './upgradesPull';

let startCount = 0;

export function initTimers() {
	startCount++;
	if (startCount === 2) {
		discordConnections[0].user.setStatus('active', 'CoooOOOooOOOoo Beep Boop CoooooOOOOoooOOOoo')
			.catch((e) => console.error('Set Active Fail!', e && e.stack || e));
		motdPull.start();
		upgradesPull.start();
	}
}