///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var childProcess = require('child_process')
var lang         = require('./lang')
var model_user   = require('../model/user')
var db           = require('../db/db')
var util_auth    = require('../util/auth')
var CONFIG = require('config')

var getBasicParam = function(req: any, res: any) {
    var params: any = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, UserName: null};
    var auth = new util_auth.Auth(req, res);

    if(!auth.isLogin()) {
        auth.clear();
        auth.set('guest', 'Guest');
    }
    params = {basepath: CONFIG.ads.basePath, title: 'Assure-It', lang: lang.lang.en, UserName: auth.getLoginName() };
    return params;
}

var index_DummyUser = function(req: any, res: any, params: any) {
    if (CONFIG && CONFIG.debugt_user && CONFIG.debug_user.loginName) {
        req.user = {displayName: CONFIG.debug_user.loginName};
    } else {
        req.user = {displayName: 'tsunade'};
    }
    //var con = new db.Database();
    //var userDAO = new model_user.UserDAO(con);
    //userDAO.login(req.user.displayName, (err:any, result: model_user.User) => {
    //    if (err) {
    //        console.error(err);
    //        res.redirect(CONFIG.ads.basePath+'/');
    //        return;
    //    }
    //    var auth = new util_auth.Auth(req, res);
    //    auth.set(result.id, result.loginName);
    res.render('index', params);
    //});
}

export var index = function(req: any, res: any) {
    var params: any = getBasicParam(req, res);
    if (process.argv.length > 2 && process.argv[2] == '--debug') {
        index_DummyUser(req, res, params);
    } else {
        res.render('index', params);
    }
}

//export var newcase = function(req: any, res: any) {
//    var params: any = getBasicParam(req, res);
//    res.render('newcase', params);
//}
//
//export var newproject = function(req: any, res: any) {
//    var params: any = getBasicParam(req, res);
//    params.projectId = req.params.id;
//    res.render('newproject', params);
//}
//
//export var caseview = function(req: any, res: any) {
//    var params: any = getBasicParam(req, res);
//    params.caseId = req.params.id;
//    params.rechost = CONFIG.rec.host;
//    params.recapi = CONFIG.rec.api;
//    params.agenthost = CONFIG.agent.host;
//    params.agentapi = CONFIG.agent.api;
//    res.render('case', params);
//}
//
//export var historyList = function(req: any, res: any) {
//    var params: any = getBasicParam(req, res);
//    params.caseId = req.params.id;
//    res.render('history', params);
//}
//
//export var history = function(req: any, res: any) {
//    var params: any = getBasicParam(req, res);
//    params.caseId = req.params.id;
//    params.commitHistory = req.params.history;
//    params.rechost = CONFIG.rec.host;
//    params.api = CONFIG.rec.api;
//    res.render('case', params);
//}
//
//export var exporter = function(req: any, res: any) {
//    var exec = childProcess.exec;
//
//    var type = req.body.type;
//    var mime = "text/plain";
//
//    res.set('Content-type','application/octet-stream; charset=utf-8');
//    switch(type) {
//        case "png":
//            mime = "image/png";
//            break;
//        case "pdf":
//            mime = "application/pdf";
//            break;
//        case "svg":
//            res.set('Content-type','image/svg+xml');
//            res.send(req.body.svg);
//            return;
//        case "json":
//            res.send(req.body.json);
//            return;
//        case "ds":
//            res.set('Content-type','text/plain; charset=utf-8');
//            var ex = new dscript.DScriptExporter();
//            res.send(ex.export(req.body.json));
//            return;
//        case "sh":
//            res.set('Content-type','text/plain; charset=utf-8');
//            var ex = new dscript.BashExporter();
//            res.send(ex.export(req.body.json));
//            return;
//        default:
//            res.send(400, "Bad Request");
//            return;
//    }
//
//    exec("/bin/mktemp -q /tmp/svg.XXXXXX", (error, stdout, stderr) => {
//        var filename :string = stdout.toString();
//        var svgname  :string = filename.trim();
//        var resname = filename.trim() + "." + type;
//        fs.writeFile(svgname, req.body.svg, (err) => {
//            if (err) throw err;
//
//            var rsvg_convert = "rsvg-convert " + svgname + " -f " + type + " -o " + resname;
//            exec(rsvg_convert, (r_error, r_stdout, r_stderr) => {
//                if(r_error) throw r_error;
//
//                var stat = fs.statSync(resname);
//                res.set("Content-Length", stat.size);
//                res.set("Content-type", mime);
//                res.send(fs.readFileSync(resname));
//            });
//        });
//    });
//};
//
//export var register = function(req: any, res: any) {
//    var con = new db.Database();
//    var userDAO = new model_user.UserDAO(con);
//
//    userDAO.register(req.body.username, req.body.password, req.body.mailAddress, (err:any, result: model_user.User) => {
//        if (err) {
//            // TODO: display error information
//            res.redirect(CONFIG.ads.basePath+'/');
//            return;
//        }
//        var auth = new util_auth.Auth(req, res);
//        auth.set(result.id, result.loginName);
//        res.redirect(CONFIG.ads.basePath+'/');
//    });
//
//};
