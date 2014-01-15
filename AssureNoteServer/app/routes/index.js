///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var childProcess = require('child_process');
var lang = require('./lang');
var model_user = require('../model/user');
var db = require('../db/db');
var util_auth = require('../util/auth');
var CONFIG = require('config');

//import ex = module('./exporter')
var getBasicParam = function (req, res) {
    var params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: null };
    var auth = new util_auth.Auth(req, res);

    if (auth.isLogin()) {
        params = { basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, userName: auth.getLoginName() };
    }
    return params;
};

var index_DummyUser = function (req, res, params) {
    if (CONFIG && CONFIG.debugt_user && CONFIG.debug_user.loginName) {
        req.user = { displayName: CONFIG.debug_user.loginName };
    } else {
        req.user = { displayName: 'tsunade' };
    }
    var con = new db.Database();
    //var userDAO = new model_user.UserDAO(con);
    //userDAO.login(req.user.displayName, (err:any, result: model_user.User) => {
    //	if (err) {
    //		console.error(err);
    //		res.redirect(CONFIG.ads.basePath+'/');
    //		return;
    //	}
    //	var auth = new util_auth.Auth(req, res);
    //	auth.set(result.id, result.loginName);
    //	res.render('index', params);
    //});
};

exports.index = function (req, res) {
    var params = getBasicParam(req, res);
    if (process.argv.length > 2 && process.argv[2] == '--debug') {
        index_DummyUser(req, res, params);
    } else {
        res.render('index', params);
    }
};
