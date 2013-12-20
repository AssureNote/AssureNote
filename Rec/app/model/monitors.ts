///<reference path='../d.ts/DefinitelyTyped/async/async.d.ts'/>

import model = module('./model');
var async = require('async');

export interface InsertArg {
	type: string;
	location: string;
	authid: string;
	begin_timestamp: Date;
	latest_timestamp: Date;
}

export class Monitor {

	constructor(public monitorid: number, public type: string, public location: string, public authid: string, public latest_recid: number, public begin_timestamp: Date, public latest_timestamp: Date) {
	}

	static tableToObject(row: any) {
		return new Monitor(row.monitorid, row.type, row.location, row.authid, row.latest_recid, row.begin_timestamp, row.latest_timestamp);
	}

}

export class MonitorDAO extends model.DAO {

	insertItem(params: InsertArg, callback: (err: any, monitorid: number)=>void): void {
		this.con.query('INSERT INTO monitors(type, location, authid, begin_timestamp, latest_timestamp) VALUES(?, ?, ?, ?, ?)',
			[params.type, params.location, params.authid, params.begin_timestamp, params.latest_timestamp],
			(err, result) => {
				if(err) {
					callback(err, null);
				}
				callback(err, result.insertId);
			}
		);
	}

	updateItem(monitorid: number, latest_recid: number, latest_timestamp: Date, callback: (err: any) => void): void {
		this.con.query('UPDATE monitors SET latest_recid=?, latest_timestamp=? WHERE monitorid=?',
			[latest_recid, latest_timestamp, monitorid],
			(err, result) => {
				callback(err);
			}
		);
	}

	getItem(monitorid: number, callback: (err: any, monitor: Monitor) => void): void {
		this.con.query('SELECT * FROM monitors WHERE monitorid=?',
			[monitorid],
			(err, result) => {
				result = result[0];
				callback(err, Monitor.tableToObject(result));
			}
		);
	}

	selectItem(type: string, location: string, callback: (err: any, monitor: Monitor) => void): void {
		this.con.query('SELECT * FROM monitors WHERE type=? AND location=?',
			[type, location],
			(err, result) => {
				if(err) {
					callback(err, null);
					return;
				}
				if(result.length == 0) {   // no such a monitor
					callback(err, null);
					return;
				}
				result = result[0];
				callback(err, Monitor.tableToObject(result));
			}
		);
	}

	getItemList(callback: (err: any, monitorList: Monitor[]) => void): void {
		this.con.query('SELECT * FROM monitors',
			(err, result) => {
				if(err) {
					callback(err, null);
				}

				var monitorList: Monitor[] = [];
				for(var i: number = 0; i < result.length; i++) {
					monitorList.push(Monitor.tableToObject(result[i]));
				}

				callback(err, monitorList);
			}
		);
	}

}
