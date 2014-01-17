///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var childProcess = require('child_process');
var lang = require('./lang');
var model_user = require('../model/user');
var db = require('../db/db');
var util_auth = require('../util/auth');
var CONFIG = require('config');

var setAnalyticsStatus = function (params) {
    if (CONFIG.analytics && CONFIG.analytics.Analytics_UA && CONFIG.analytics.Analytics_Domain) {
        params.Analytics_UA = CONFIG.analytics.Analytics_UA;
        params.Analytics_Domain = CONFIG.analytics.Analytics_Domain;
    }
};

var getBasicParam = function (req, res) {
    var params = { basepath: CONFIG.assurenote.basepath, title: 'AssureNote', lang: lang.lang.en, UserName: null };
    var auth = new util_auth.Auth(req, res);

    if (!auth.isLogin()) {
        auth.clear();
        auth.set('guest', 'Guest');
    }
    params.UserName = auth.getLoginName();
    setAnalyticsStatus(params);
    return params;
};

var index_DummyUser = function (req, res, params) {
    if (CONFIG && CONFIG.debugt_user && CONFIG.debug_user.loginName) {
        req.user = { displayName: CONFIG.debug_user.loginName };
    } else {
        req.user = { displayName: 'tsunade' };
    }

    //var con = new db.Database();
    //var userDAO = new model_user.UserDAO(con);
    //userDAO.login(req.user.displayName, (err:any, result: model_user.User) => {
    //    if (err) {
    //        console.error(err);
    //        res.redirect(CONFIG.ads.basepath+'/');
    //        return;
    //    }
    //    var auth = new util_auth.Auth(req, res);
    //    auth.set(result.id, result.loginName);
    res.render('index', params);
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
