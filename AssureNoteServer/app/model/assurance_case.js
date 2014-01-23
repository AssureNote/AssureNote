var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');

var error = require('../api/error');

var async = require('async');
var _ = require('underscore');
var crypto = require('crypto');

/**
* @class GLOBAL
*/
/**
* @method getMd5String
* @return {String}
*/
function getMd5String() {
    var d = new Date();
    var md5 = crypto.createHash('md5');

    md5.update(d.toString() + d.getMilliseconds(), 'utf-8');
    return md5.digest('hex');
}
exports.getMd5String = getMd5String;

/**
* @class AssuranceCase
* @constructor
* @param {String} hashKey
* @param {String} userKey
* @param {String} data
* @param {String} [meta_data]
*/
var AssuranceCase = (function () {
    function AssuranceCase(hashKey, userKey, data, meta_data) {
        this.hashKey = hashKey;
        this.userKey = userKey;
        this.data = data;
        this.meta_data = meta_data;
    }
    /**
    * @method tableToObject
    * @static
    * @param {Any} table
    * @return {AssuranceCase}
    */
    AssuranceCase.tableToObject = function (table) {
        return new AssuranceCase(table.hash_key, table.user_key, table.data, table.meta_data);
    };
    return AssuranceCase;
})();
exports.AssuranceCase = AssuranceCase;

/**
* @class AssuranceCaseDAO
* @constructor
* @extends DAO
*/
var AssuranceCaseDAO = (function (_super) {
    __extends(AssuranceCaseDAO, _super);
    function AssuranceCaseDAO() {
        _super.apply(this, arguments);
    }
    /**
    * @method get
    * @param {String} hashKey
    * @param {Function} callback
    * @return {void}
    */
    AssuranceCaseDAO.prototype.get = function (hashKey, callback) {
        var _this = this;
        async.waterfall([
            function (next) {
                _this.con.query('SELECT * FROM `assurance_case` WHERE `hash_key` = ?', [hashKey], function (err, result) {
                    return next(err, result);
                });
            },
            function (result, next) {
                if (result.length == 0) {
                    next(new error.NotFoundError('AssuranceCase is not found.', { fileId: hashKey }));
                    return;
                }
                next(null, AssuranceCase.tableToObject(result[0]));
            }
        ], function (err, acase) {
            callback(err, acase);
        });
    };

    /**
    * @method insert
    * @param {String} userKey
    * @param {String} data
    * @param {String} meta_data
    * @param {Function} callback
    * @return {void}
    */
    AssuranceCaseDAO.prototype.insert = function (userKey, data, meta_data, callback) {
        if (!meta_data) {
            meta_data = '';
        }
        var hashKey = exports.getMd5String();

        //async.waterfall([
        this.con.query('INSERT INTO `assurance_case` (`hash_key`, `data`, `meta_data`, `user_key`) VALUES (?, ?, ?, ?)', [hashKey, data, meta_data, userKey], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(err, hashKey);
        });
    };
    return AssuranceCaseDAO;
})(model.DAO);
exports.AssuranceCaseDAO = AssuranceCaseDAO;
