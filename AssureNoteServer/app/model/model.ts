import db = require('../db/db');
import events = require('events');

/**
  @class DAO
  @constructor
  @param {db.Database} con
  */
export class DAO extends events.EventEmitter {
    constructor(public con: db.Database) {
        super();
    }
}
