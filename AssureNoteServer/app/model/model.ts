import db = require('../db/db');
import events = require('events');

export class DAO extends events.EventEmitter {
	constructor(public con: db.Database) {
		super();
	}
}
