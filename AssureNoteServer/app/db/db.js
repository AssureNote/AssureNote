///<reference path='../types/mysql.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mysql = require('mysql');
var events = require('events');
var CONFIG = require('config');

/**
@class Database
@constructor
@extends events.EventEmitter
*/
var Database = (function (_super) {
    __extends(Database, _super);
    function Database() {
        _super.call(this);
        this.con = Database.getConnection();
    }
    /**
    @property con
    @type mysql.Connection
    @public
    */
    /**
    @method getConnection
    @static
    @return {mysql.Connection} con
    */
    Database.getConnection = function () {
        return mysql.createConnection({
            host: CONFIG.mysql.host,
            user: CONFIG.mysql.user,
            password: CONFIG.mysql.password,
            database: CONFIG.mysql.database
        });
    };

    Database.prototype.query = function (sql, values, callback) {
        /**
        @method query
        @param {String} sql
        @param {Array} values
        @param {mysql.QueryCallback} callback
        @return {void} void
        */
        if (callback === undefined && typeof values === 'function') {
            callback = values;
        }

        callback = this._bindErrorHandler(callback);

        if (this.con) {
            this.con.query(sql, values, callback);
        } else {
            callback('Connection is closed');
        }
    };

    /**
    @method begin
    @param {mysql.QueryCallback} callback
    @return {void}
    */
    Database.prototype.begin = function (callback) {
        var _this = this;
        this.query('SET autocommit=0', function (err, result) {
            if (err) {
                callback(err, result);
            } else {
                _this.query('START TRANSACTION', function (err, result) {
                    callback(err, result);
                });
            }
        });
    };

    /**
    @method commit
    @param {mysql.QueryCallback} callback
    @return {void}
    */
    Database.prototype.commit = function (callback) {
        this.query('COMMIT', function (err, result) {
            callback(err, result);
        });
    };

    /**
    @method rollback
    @param {mysql.QueryCallback} [callback]
    @return {void}
    */
    Database.prototype.rollback = function (callback) {
        callback = callback || this._defaultCallback;
        if (this.con) {
            this.query('ROLLBACK', callback);
        } else {
            callback(null, null);
        }
    };

    Database.prototype._rollback = function (callback) {
        callback = callback || this._defaultCallback;
        if (this.con) {
            // don't call this.query. it occure recursive rollback with _bind_ErrorHandler.
            this.con.query('ROLLBACK', function (err, query) {
                callback(err, query);
            });
        } else {
            callback(null, null);
        }
    };

    /**
    @method endTransaction
    @param {mysql.QueryCallback} callback
    @return {void}
    */
    Database.prototype.endTransaction = function (callback) {
        this.query('SET autocommit=1', function (err, query) {
            callback(err, query);
        });
    };

    /**
    @method close
    @param {mysql.QueryCallback} [callback]
    @return {void}
    */
    Database.prototype.close = function (callback) {
        callback = callback || this._defaultCallback;
        if (this.con) {
            this.con.end(callback);
            this.con = null;
        }
    };

    Database.prototype._defaultCallback = function (err, result) {
        if (err) {
            this.emit('error', err);
        }
    };

    Database.prototype._bindErrorHandler = function (callback) {
        var _this = this;
        return function (err, result) {
            if (err) {
                console.error(err);
                _this._rollback(function (err, result) {
                    _this.close();
                });
            }
            callback(err, result);
        };
    };
    return Database;
})(events.EventEmitter);
exports.Database = Database;
