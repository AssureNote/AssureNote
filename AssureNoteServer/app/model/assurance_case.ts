import model      = require('./model');
import model_user = require('./user');
import error      = require('../api/error');
import constant   = require('../constant');
var async   = require('async');
var _          = require('underscore');
var crypto     = require('crypto');

/**
  * @class GLOBAL
  */

/**
  * @method getMd5String
  * @return {String}
  */
export function getMd5String(): string {
    var d = new Date();
    var md5 = crypto.createHash('md5');

    md5.update(d.toString() + d.getMilliseconds(), 'utf-8');
    return md5.digest('hex');
}

/**
  * @class AssuranceCase
  * @constructor
  * @param {String} hashKey
  * @param {String} userKey
  * @param {String} data
  * @param {String} [meta_data]
  */
export class AssuranceCase {
    constructor(public hashKey: string, public userKey: string, public data: string, public meta_data?: string) {
    }

    /**
      * @method tableToObject
      * @static
      * @param {Any} table
      * @return {AssuranceCase}
      */
    static tableToObject(table: any): AssuranceCase {
        return new AssuranceCase(table.hash_key, table.user_key, table.data, table.meta_data);
    }
}

/**
  * @class AssuranceCaseDAO
  * @constructor
  * @extends DAO
  */
export class AssuranceCaseDAO extends model.DAO {
    /**
      * @method get
      * @param {String} hashKey
      * @param {Function} callback
      * @return {void}
      */
    get(hashKey: string, callback: (err: any, acase: AssuranceCase) => void) {
        async.waterfall([
            (next) => {
                this.con.query('SELECT * FROM `assurance_case` WHERE `hash_key` = ?', [hashKey], (err:any, result:any) => next(err, result));
            },
            (result:any, next) => {
                if (result.length == 0) {
                    next(new error.NotFoundError('Assurance Case not found.', {fileId: hashKey}));
                    return;
                }
                next(null, AssuranceCase.tableToObject(result[0]));
            }
        ], (err:any, acase:AssuranceCase) => {
            callback(err, acase);
        });
    }

    /**
      * @method insertOrUpdate
      * @param {String} userKey
      * @param {String} data
      * @param {String} meta_data
      * @param {String} fileId
      * @param {Function} callback
      * @return {void}
      */
    insertOrUpdate(userKey: string, data: string, meta_data: string, fileId: string, callback: (err:any, hashKey: string)=>void): void {
        if(!meta_data) {
            meta_data = '';
        }
        if(fileId == null || fileId == "") {
            this.insert(userKey, data, meta_data, callback);
        } else {
            this.con.query('SELECT `hash_key` FROM `assurance_case` WHERE `hash_key` = ?',
                    [fileId],
                    (err, result) => {
                        if(err) {
                            callback(err, null);
                            return;
                        }
                        console.log("%j",result);
                        if(result.hash_key) {
                            this.insert(userKey, data, meta_data, callback);
                        } else {
                            this.update(userKey, data, meta_data, fileId, callback);
                        }
            });
        }
    }

    /**
      * @method insert
      * @param {String} userKey
      * @param {String} data
      * @param {String} meta_data
      * @param {Function} callback
      * @return {void}
      */
    insert(userKey: string, data: string, meta_data: string, callback: (err:any, hashKey: string)=>void): void {
        if(!meta_data) {
            meta_data = '';
        }
        var hashKey = getMd5String();
        this.con.query('INSERT INTO `assurance_case` (`hash_key`, `data`, `meta_data`, `user_key`) VALUES (?, ?, ?, ?)'
                , [hashKey, data, meta_data, userKey],
                (err, result) => {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(err, hashKey);
                });
    }

    /**
      * @method update
      * @param {String} userKey
      * @param {String} data
      * @param {String} meta_data
      * @param {String} fileId
      * @param {Function} callback
      * @return {void}
      */
    update(userKey: string, data: string, meta_data: string, fileId: string, callback: (err:any, hashKey: string)=>void): void {
        if(!meta_data) {
            meta_data = '';
        }
        this.con.query('UPDATE `assurance_case` SET `data`=?, `meta_data`=?, `user_key`=? WHERE `hash_key` = ?',
                [data, meta_data, userKey, fileId],
                (err, result) => {
                    if(err) {
                        callback(err, null);
                        return;
                    }
                    callback(err, fileId);
        });
    }
}
