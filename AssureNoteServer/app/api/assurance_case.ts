///<reference path='../DefinitelyTyped/async/async.d.ts'/>

var db                   = require('../db/db')
import type                 = require('./type')
var constant             = require('../constant')
var model_assurance_case = require('../model/assurance_case')
var model_user           = require('../model/user')
var error                = require('./error')
var async                = require('async')
var _                    = require('underscore');

export function upload(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	//TODO
}

export function download(params:any, userId: number, callback: type.Callback) {
	var con = new db.Database();
	//TODO
}

