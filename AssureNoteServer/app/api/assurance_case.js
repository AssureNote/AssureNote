///<reference path='../DefinitelyTyped/async/async.d.ts'/>
/**
* @class GLOBAL
*/
var db = require('../db/db');

var constant = require('../constant');
var model_assurance_case = require('../model/assurance_case');
var model_user = require('../model/user');
var error = require('./error');
var async = require('async');
var _ = require('underscore');

/**
* @method upload
* @static
* @param {Object} params
* @param {String} userIdKey
* @param {type.Callback} callback
* @return {void}
*/
function upload(params, userIdKey, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.content)
            checks.push('Contents is required.');
        if (params && !params.fileId)
            params.fileId = "";
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }
    if (!validate(params))
        return;

    var con = new db.Database();

    var userDAO = new model_user.UserDAO(con);
    var caseDAO = new model_assurance_case.AssuranceCaseDAO(con);
    async.waterfall([
        function (next) {
            con.begin(function (err, result) {
                return next(err);
            });
        },
        function (next) {
            userDAO.select(userIdKey, function (err, user) {
                return next(err, user);
            });
        },
        function (user, next) {
            caseDAO.insertOrUpdate(user.key, params.content, params.meta_data, params.fileId, function (err, result) {
                return next(err, result);
            });
        },
        function (commitResult, next) {
            con.commit(function (err, result) {
                return next(err, commitResult);
            });
        }
    ], function (err, result) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess({ fileId: result });
    });
}
exports.upload = upload;

/**
* @method download
* @static
* @param {Object} params
* @param {String} userIdKey
* @param {type.Callback} callback
* @return {void}
*/
function download(params, userIdKey, callback) {
    function validate(params) {
        var checks = [];
        if (!params)
            checks.push('Parameter is required.');
        if (params && !params.fileId)
            checks.push('FileID is required.');
        if (checks.length > 0) {
            callback.onFailure(new error.InvalidParamsError(checks, null));
            return false;
        }
        return true;
    }
    if (!validate(params))
        return;

    var con = new db.Database();

    var caseDAO = new model_assurance_case.AssuranceCaseDAO(con);
    async.waterfall([function (next) {
            caseDAO.get(params.fileId, function (err, acase) {
                return next(err, acase);
            });
        }], function (err, result) {
        con.close();
        if (err) {
            callback.onFailure(err);
            return;
        }
        callback.onSuccess({ content: result.data });
    });
}
exports.download = download;
