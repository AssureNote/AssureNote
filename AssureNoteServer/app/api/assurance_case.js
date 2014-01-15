///<reference path='../DefinitelyTyped/async/async.d.ts'/>
var db = require('../db/db');

var constant = require('../constant');
var model_assurance_case = require('../model/assurance_case');
var model_user = require('../model/user');
var error = require('./error');
var async = require('async');
var _ = require('underscore');

function upload(params, userId, callback) {
    var con = new db.Database();
    //TODO
}
exports.upload = upload;

function download(params, userId, callback) {
    var con = new db.Database();
    //TODO
}
exports.download = download;

