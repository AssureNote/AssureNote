///<reference path='../d.ts/DefinitelyTyped/async/async.d.ts'/>

import model = module('./model');
import model_monitors = module('./monitors');
var async = require('async');

export interface InsertArg {
	monitorid: number;
	data: number;
	context?: string;
	timestamp: Date;
}

export class Rawdata {

	type: string;
	location: string;
	authid: string;

	constructor(public recid: number, public data: number, public context: string, public timestamp: Date) {
		this.type = null;
		this.location = null;
		this.authid = null;
	}

	static tableToObject(row: any) {
		return new Rawdata(row.recid, row.data, row.context, row.timestamp);
	}

	setMonitorInfo(type: string, location: string, authid: string): void {
		this.type = type;
		this.location = location;
		this.authid = authid;
	}

}

export class RawdataDAO extends model.DAO {

	insertRawdata(params: InsertArg, callback: (err: any, recid: number) => void): void {
		this.con.query('INSERT INTO rawdata(monitorid, data, context, timestamp) VALUES(?, ?, ?, ?)',
			[params.monitorid, params.data, params.context ? params.context : '', params.timestamp],
			(err, result) => {
				if(err) {
					callback(err, null);
					return;
				}
				callback(err, result.insertId);
			}
		);
	}

	_fillRawdataWithMonitorInfo(rawdata: Rawdata, monitorid: number, callback: (err: any, rawdata: Rawdata) => void): void {
		var monitorDAO = new model_monitors.MonitorDAO(this.con);
		monitorDAO.getItem(monitorid, (err: any, monitor: model_monitors.Monitor) => {
			rawdata.setMonitorInfo(monitor.type, monitor.location, monitor.authid);
			callback(err, rawdata);
		});
	}

	getRawdata(recid: number, callback: (err: any, rawdata: Rawdata)=>void): void {
		var self = this;
		async.waterfall([
			(next) => {
				this.con.query('SELECT * FROM rawdata WHERE recid=?',
					[recid],
					(err, result) => {
						result = result[0];
						next(err, Rawdata.tableToObject(result), result.monitorid);
					}
				);
			},
			(rawdata: Rawdata, monitorid: number, next) => {
				self._fillRawdataWithMonitorInfo(rawdata, monitorid, next);
			}
		],
		(err: any, rawdata: Rawdata) => {
			callback(err, rawdata);
		});
	}

	getRawdataWithMonitorInfo(recid: number, monitor: model_monitors.Monitor, callback: (err: any, rawdata: Rawdata)=>void): void {
		this.con.query('SELECT * FROM rawdata WHERE recid=?',
			[recid],
			(err, result) => {
				result = result[0];
				var rawdata = Rawdata.tableToObject(result);
				rawdata.setMonitorInfo(monitor.type, monitor.location, monitor.authid);
				callback(err, rawdata);
			}
		);
	}

}
