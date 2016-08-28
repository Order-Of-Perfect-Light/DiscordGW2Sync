import * as sqlite3 from 'sqlite3';
import * as path from 'path';

let db: sqlite3.Database;

export function init(directory) {
	db = new sqlite3.Database(path.join(directory, 'db.sqlite3'));
	db.run('CREATE TABLE IF NOT EXISTS userList (id INTEGER PRIMARY KEY AUTOINCREMENT, gw2User CHAR, discordUser CHAR)');
}

export function get(statement, args) {
	return new Promise((resolve, reject) => {
		db.all(statement, args, (err, row) => {
			if(err) {
				reject(err);
			} else {
				resolve(row);
			}
		})
	})
}

export function run(statement, args) {
	return new Promise((resolve, reject) => {
		db.run(statement, args, (err) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		})
	})
}