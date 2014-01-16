import model      = require('./model');
import model_user = require('./user');
import error      = require('../api/error');
import constant   = require('../constant');
//var async         = require('async'); //TODO no longer needed?
var _          = require('underscore');
var crypto     = require('crypto');

export function getMd5String(): string {
    var d = new Date();
    var md5 = crypto.createHash('md5');

    md5.update(d.toString() + d.getMilliseconds(), 'utf-8');
    return md5.digest('hex');
}

export class AssuranceCase {
    constructor(public hashKey: string, public userKey: string, public data: string, public meta_data?: string) {
    }
    static tableToObject(table: any) {
        return new AssuranceCase(table.hash_key, table.user_key, table.data, table.meta_data);
    }
}

export class AssuranceCaseDAO extends model.DAO {
    get(hashKey: string, callback: (err: any, acase: AssuranceCase) => void) {
        async.waterfall([
            (next) => {
                this.con.query('SELECT * FROM `assurance_case` WHERE `hash_key` = ?', [hashKey], (err:any, result:any) => next(err, result));
            },
            (result:any, next) => {
                if (result.length == 0) {
                    next(new error.NotFoundError('AssuranceCase is not found.', {fileId: hashKey}));
                    return;
                }
                next(null, AssuranceCase.tableToObject(result[0]));
            }
        ], (err:any, acase:AssuranceCase) => {
            callback(err, acase);
        });
    }

    insert(userKey: string, data: string, meta_data: string, callback: (err:any, hashKey: string)=>void): void {
        if(!meta_data) {
            meta_data = '';
        }
        var hashKey = getMd5String();
        //async.waterfall([
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
}
