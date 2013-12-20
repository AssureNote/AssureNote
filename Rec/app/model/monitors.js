var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var async = require('async');

var Monitor = (function () {
    function Monitor(monitorid, type, location, authid, latest_recid, begin_timestamp, latest_timestamp) {
        this.monitorid = monitorid;
        this.type = type;
        this.location = location;
        this.authid = authid;
        this.latest_recid = latest_recid;
        this.begin_timestamp = begin_timestamp;
        this.latest_timestamp = latest_timestamp;
    }
    Monitor.tableToObject = function (row) {
        return new Monitor(row.monitorid, row.type, row.location, row.authid, row.latest_recid, row.begin_timestamp, row.latest_timestamp);
    };
    return Monitor;
})();
exports.Monitor = Monitor;

var MonitorDAO = (function (_super) {
    __extends(MonitorDAO, _super);
    function MonitorDAO() {
        _super.apply(this, arguments);
    }
    MonitorDAO.prototype.insertItem = function (params, callback) {
        this.con.query('INSERT INTO monitors(type, location, authid, begin_timestamp, latest_timestamp) VALUES(?, ?, ?, ?, ?)', [params.type, params.location, params.authid, params.begin_timestamp, params.latest_timestamp], function (err, result) {
            if (err) {
                callback(err, null);
            }
            callback(err, result.insertId);
        });
    };

    MonitorDAO.prototype.updateItem = function (monitorid, latest_recid, latest_timestamp, callback) {
        this.con.query('UPDATE monitors SET latest_recid=?, latest_timestamp=? WHERE monitorid=?', [latest_recid, latest_timestamp, monitorid], function (err, result) {
            callback(err);
        });
    };

    MonitorDAO.prototype.getItem = function (monitorid, callback) {
        this.con.query('SELECT * FROM monitors WHERE monitorid=?', [monitorid], function (err, result) {
            result = result[0];
            callback(err, Monitor.tableToObject(result));
        });
    };

    MonitorDAO.prototype.selectItem = function (type, location, callback) {
        this.con.query('SELECT * FROM monitors WHERE type=? AND location=?', [type, location], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            if (result.length == 0) {
                callback(err, null);
                return;
            }
            result = result[0];
            callback(err, Monitor.tableToObject(result));
        });
    };

    MonitorDAO.prototype.getItemList = function (callback) {
        this.con.query('SELECT * FROM monitors', function (err, result) {
            if (err) {
                callback(err, null);
            }

            var monitorList = [];
            for (var i = 0; i < result.length; i++) {
                monitorList.push(Monitor.tableToObject(result[i]));
            }

            callback(err, monitorList);
        });
    };
    return MonitorDAO;
})(model.DAO);
exports.MonitorDAO = MonitorDAO;

