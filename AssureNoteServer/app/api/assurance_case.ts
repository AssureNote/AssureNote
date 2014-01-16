///<reference path='../DefinitelyTyped/async/async.d.ts'/>

var db                   = require('../db/db')
import type                 = require('./type')
var constant             = require('../constant')
import model_assurance_case = require('../model/assurance_case')
import model_user           = require('../model/user')
var error                = require('./error')
var async                = require('async')
var _                    = require('underscore');

export function upload(params:any, userIdKey: string, callback: type.Callback) {
    function validate(params:any) {
        var checks = [];
        if (!params) checks.push('Parameter is required.');
        if (params && !params.content) checks.push('Contents is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }
    if (!validate(params)) return;

    var con = new db.Database();

    var userDAO = new model_user.UserDAO(con);
    var caseDAO = new model_assurance_case.AssuranceCaseDAO(con);
    async.waterfall([
            (next) => {
                con.begin((err, result) => next(err));
            },
            (next) => {
                userDAO.select(userIdKey, (err:any, user: model_user.User) => next(err, user));
            },
            (user:model_user.User, next) => {
                caseDAO.insert(user.key, params.content, params.meta_data, (err:any, result) => next(err, result));
            },
            (commitResult, next) => {
                con.commit((err, result) => next(err, commitResult));
            }
        ],
        (err:any, result:any) => {
            con.close();
            if (err) {
                callback.onFailure(err);
                return;
            }
            callback.onSuccess({fileId: result});
        }
    );
}

export function download(params:any, userIdKey: string, callback: type.Callback) {
    function validate(params:any) {
        var checks = [];
        if (!params) checks.push('Parameter is required.');
        if (params && !params.fileId) checks.push('FileID is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }
    if (!validate(params)) return;

    var con = new db.Database();

    var caseDAO = new model_assurance_case.AssuranceCaseDAO(con);
    async.waterfall([
        (next) => {
            caseDAO.get(params.fileId, (err: any, acase: model_assurance_case.AssuranceCase) => next(err, acase));
        }],
        (err:any, result: model_assurance_case.AssuranceCase) => {
            con.close();
            if (err) {
                callback.onFailure(err);
                return;
            }
        callback.onSuccess({content: result.data});
    });

}

