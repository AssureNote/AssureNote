///<reference path='../d.ts/DefinitelyTyped/async/async.d.ts'/>

import db = module('../db/db');
import type = module('./type')
import error = module('./error');
import model_monitors = module('../model/monitors');
import model_rawdata = module('../model/rawdata');
var async = require('async');

export function pushRawData(params: any, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if(!params) checks.push('Parameter is required.');
		if(params && !params.type) checks.push('Monitor type is required.');
		if(params && !params.location) checks.push('Monitor location is required.');
		if(params && !params.data) checks.push('Monitor data is required.');
		if(params && !params.authid) checks.push('Auth ID is required.');
		if(checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if(!validate(params)) return;

	var con = new db.Database();
	var monitorDAO = new model_monitors.MonitorDAO(con);
	var rawdataDAO = new model_rawdata.RawdataDAO(con);
	var timestamp = new Date();

	async.waterfall([
		(next) => {
			con.begin((err, result) => next(err));
		},
		(next) => {
			monitorDAO.selectItem(params.type, params.location, (err: any, monitor: model_monitors.Monitor) => next(err, monitor));
		},
		(monitor: model_monitors.Monitor, next) => {
			if(monitor) {
				next(null, monitor.monitorid);
			}
			else {
				params['begin_timestamp'] = timestamp;
				params['latest_timestamp'] = timestamp;
				monitorDAO.insertItem(params, (err: any, monitorid: number) => next(err, monitorid));
			}
		},
		(monitorid: number, next) => {
			rawdataDAO.insertRawdata({ monitorid: monitorid, data: params.data, context: params.context, timestamp: timestamp }, (err: any, recid: number) => next(err, monitorid, recid));
		},
		(monitorid: number, recid: number, next) => {
			monitorDAO.updateItem(monitorid, recid, timestamp, (err: any) => next(err, recid));
		},
		(recid: number, next) => {
			con.commit((err, result) => next(err, recid));
		}
	], (err: any, recid: number) => {
		if(err) {
			con.rollback();
			con.close();
			callback.onFailure(err);
			return;
		}
		con.close();
		callback.onSuccess({ recid: recid });
	});
}

export function getRawData(params: any, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if(!params) checks.push('Parameter is required.');
		if(params && !params.recid) checks.push('Rawdata ID is required.');
		if(checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if(!validate(params)) return;

	var con = new db.Database();
	var rawdataDAO = new model_rawdata.RawdataDAO(con);

	async.waterfall([
		(next) => {
			con.begin((err, result) => next(err));
		},
		(next) => {
			rawdataDAO.getRawdata(params.recid, (err: any, rawdata: model_rawdata.Rawdata) => next(err, rawdata));
		},
		(rawdata: model_rawdata.Rawdata, next) => {
			con.commit((err, result) => next(err, rawdata));
		}
	],
	(err: any, rawdata: model_rawdata.Rawdata, next) => {
		if(err) {
			con.rollback();
			con.close();
			callback.onFailure(err);
			return;
		}
		con.close();
		callback.onSuccess(rawdata);
	});

}

export function getLatestData(params: any, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if(!params) checks.push('Parameter is required.');
		if(params && !params.type) checks.push('Monitor type is required.');
		if(params && !params.location) checks.push('Monitor location is required.');
		if(checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if(!validate(params)) return;

	var con = new db.Database();
	var monitorDAO = new model_monitors.MonitorDAO(con);
	var rawdataDAO = new model_rawdata.RawdataDAO(con);
	var timestamp = new Date();

	async.waterfall([
		(next) => {
			con.begin((err, result) => next(err));
		},
		(next) => {
			monitorDAO.selectItem(params.type, params.location, (err: any, monitor: model_monitors.Monitor) => next(err, monitor));
		},
		(monitor: model_monitors.Monitor, next) => {
			rawdataDAO.getRawdataWithMonitorInfo(monitor.latest_recid, monitor, (err: any, rawdata: model_rawdata.Rawdata) => next(err, rawdata));
		},
		(rawdata: model_rawdata.Rawdata, next) => {
			con.commit((err, result) => next(err, rawdata));
		}
	],
	(err: any, rawdata: model_rawdata.Rawdata, next) => {
		if(err) {
			con.rollback();
			con.close();
			callback.onFailure(err);
			return;
		}
		con.close();
		callback.onSuccess(rawdata);
	});
}

export function getRawDataList(params: any, callback: type.Callback) {
	function validate(params: any): boolean {
		var checks = [];
		if(!params) checks.push('Parameter is required.');
		if(params && !params.type) checks.push('Monitor type is required.');
		if(params && !params.location) checks.push('Monitor location is required.');
		if(checks.length > 0) {
			callback.onFailure(new error.InvalidParamsError(checks, null));
		}
		return true;
	}
	if(!validate(params)) return;

	// TODO
	callback.onSuccess([]);    // FIXME
}

export function getMonitorList(params: any, callback: type.Callback) {
	var con = new db.Database();
	var monitorDAO = new model_monitors.MonitorDAO(con);

	async.waterfall([
		(next) => {
			con.begin((err, result) => next(err));
		},
		(next) => {
			monitorDAO.getItemList((err: any, monitorList: model_monitors.Monitor[]) => next(err, monitorList));
		},
		(monitorList: model_monitors.Monitor[], next) => {
			con.commit((err, result) => next(err, monitorList));
		}
	],
	(err: any, monitorList: model_monitors.Monitor[], next) => {
		if(err) {
			con.rollback();
			con.close();
			callback.onFailure(err);
			return;
		}
		con.close();
		callback.onSuccess(monitorList);
	});

}
