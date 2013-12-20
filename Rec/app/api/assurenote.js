var db = require('../db/db');

var error = require('./error');
var model_monitors = require('../model/monitors');
var model_rawdata = require('../model/rawdata');
var async = require('async');

function pushRawData(params, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.type)
            checks.push('Monitor type is required.');
        if (params && !params.location)
            checks.push('Monitor location is required.');
        if (params && !params.data)
            checks.push('Monitor data is required.');
        if (params && !params.authid)
            checks.push('Auth ID is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
        }
        return true;
    }
    if (!validate(params))
        return;

    var con = new db.Database();
    var monitorDAO = new model_monitors.MonitorDAO(con);
    var rawdataDAO = new model_rawdata.RawdataDAO(con);
    var timestamp = new Date();

    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            monitorDAO.selectItem(params.type, params.location, function (err, monitor) {
                return next(err, monitor);
            });
        },
        function (monitor, next) {
            if (monitor) {
                next(null, monitor.monitorid);
            } else {
                params['begin_timestamp'] = timestamp;
                params['latest_timestamp'] = timestamp;
                monitorDAO.insertItem(params, function (err, monitorid) {
                    return next(err, monitorid);
                });
            }
        },
        function (monitorid, next) {
            rawdataDAO.insertRawdata({ monitorid: monitorid, data: params.data, context: params.context, timestamp: timestamp }, function (err, recid) {
                return next(err, monitorid, recid);
            });
        },
        function (monitorid, recid, next) {
            monitorDAO.updateItem(monitorid, recid, timestamp, function (err) {
                return next(err, recid);
            });
        },
        function (recid, next) {
            con.commit(function (err, result) {
                return next(err, recid);
            });
        }
    ], function (err, recid) {
        if (err) {
            con.rollback();
            con.close();
            callback.onFailure(err);
            return;
        }
        con.close();
        callback.onSuccess({ recid: recid });
    });
}
exports.pushRawData = pushRawData;

function getRawData(params, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.recid)
            checks.push('Rawdata ID is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
        }
        return true;
    }
    if (!validate(params))
        return;

    var con = new db.Database();
    var rawdataDAO = new model_rawdata.RawdataDAO(con);

    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            rawdataDAO.getRawdata(params.recid, function (err, rawdata) {
                return next(err, rawdata);
            });
        },
        function (rawdata, next) {
            con.commit(function (err, result) {
                return next(err, rawdata);
            });
        }
    ], function (err, rawdata, next) {
        if (err) {
            con.rollback();
            con.close();
            callback.onFailure(err);
            return;
        }
        con.close();
        callback.onSuccess(rawdata);
    });
}
exports.getRawData = getRawData;

function getLatestData(params, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.type)
            checks.push('Monitor type is required.');
        if (params && !params.location)
            checks.push('Monitor location is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
        }
        return true;
    }
    if (!validate(params))
        return;

    var con = new db.Database();
    var monitorDAO = new model_monitors.MonitorDAO(con);
    var rawdataDAO = new model_rawdata.RawdataDAO(con);
    var timestamp = new Date();

    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            monitorDAO.selectItem(params.type, params.location, function (err, monitor) {
                return next(err, monitor);
            });
        },
        function (monitor, next) {
            rawdataDAO.getRawdataWithMonitorInfo(monitor.latest_recid, monitor, function (err, rawdata) {
                return next(err, rawdata);
            });
        },
        function (rawdata, next) {
            con.commit(function (err, result) {
                return next(err, rawdata);
            });
        }
    ], function (err, rawdata, next) {
        if (err) {
            con.rollback();
            con.close();
            callback.onFailure(err);
            return;
        }
        con.close();
        callback.onSuccess(rawdata);
    });
}
exports.getLatestData = getLatestData;

function getRawDataList(params, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.type)
            checks.push('Monitor type is required.');
        if (params && !params.location)
            checks.push('Monitor location is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
        }
        return true;
    }
    if (!validate(params))
        return;

    callback.onSuccess([]);
}
exports.getRawDataList = getRawDataList;

function getMonitorList(params, callback) {
    var con = new db.Database();
    var monitorDAO = new model_monitors.MonitorDAO(con);

    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            monitorDAO.getItemList(function (err, monitorList) {
                return next(err, monitorList);
            });
        },
        function (monitorList, next) {
            con.commit(function (err, result) {
                return next(err, monitorList);
            });
        }
    ], function (err, monitorList, next) {
        if (err) {
            con.rollback();
            con.close();
            callback.onFailure(err);
            return;
        }
        con.close();
        callback.onSuccess(monitorList);
    });
}
exports.getMonitorList = getMonitorList;

