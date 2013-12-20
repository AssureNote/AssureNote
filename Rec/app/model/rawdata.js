var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var model_monitors = require('./monitors');
var async = require('async');

var Rawdata = (function () {
    function Rawdata(recid, data, context, timestamp) {
        this.recid = recid;
        this.data = data;
        this.context = context;
        this.timestamp = timestamp;
        this.type = null;
        this.location = null;
        this.authid = null;
    }
    Rawdata.tableToObject = function (row) {
        return new Rawdata(row.recid, row.data, row.context, row.timestamp);
    };

    Rawdata.prototype.setMonitorInfo = function (type, location, authid) {
        this.type = type;
        this.location = location;
        this.authid = authid;
    };
    return Rawdata;
})();
exports.Rawdata = Rawdata;

var RawdataDAO = (function (_super) {
    __extends(RawdataDAO, _super);
    function RawdataDAO() {
        _super.apply(this, arguments);
    }
    RawdataDAO.prototype.insertRawdata = function (params, callback) {
        this.con.query('INSERT INTO rawdata(monitorid, data, context, timestamp) VALUES(?, ?, ?, ?)', [params.monitorid, params.data, params.context ? params.context : '', params.timestamp], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, result.insertId);
        });
    };

    RawdataDAO.prototype._fillRawdataWithMonitorInfo = function (rawdata, monitorid, callback) {
        var monitorDAO = new model_monitors.MonitorDAO(this.con);
        monitorDAO.getItem(monitorid, function (err, monitor) {
            rawdata.setMonitorInfo(monitor.type, monitor.location, monitor.authid);
            callback(err, rawdata);
        });
    };

    RawdataDAO.prototype.getRawdata = function (recid, callback) {
        var _this = this;
        var self = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM rawdata WHERE recid=?', [recid], function (err, result) {
                    result = result[0];
                    next(err, Rawdata.tableToObject(result), result.monitorid);
                });
            },
            function (rawdata, monitorid, next) {
                self._fillRawdataWithMonitorInfo(rawdata, monitorid, next);
            }
        ], function (err, rawdata) {
            callback(err, rawdata);
        });
    };

    RawdataDAO.prototype.getRawdataWithMonitorInfo = function (recid, monitor, callback) {
        this.con.query('SELECT * FROM rawdata WHERE recid=?', [recid], function (err, result) {
            result = result[0];
            var rawdata = Rawdata.tableToObject(result);
            rawdata.setMonitorInfo(monitor.type, monitor.location, monitor.authid);
            callback(err, rawdata);
        });
    };
    return RawdataDAO;
})(model.DAO);
exports.RawdataDAO = RawdataDAO;

