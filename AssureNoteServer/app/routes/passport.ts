///<reference path='../DefinitelyTyped/node/node.d.ts'/>
///<reference path='../DefinitelyTyped/express/express.d.ts'/>

var db = require('../db/db');
import model_user           = require('../model/user');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var util_auth    = require('../util/auth')
var CONFIG = require('config');

function GetUserId(user: any) : string {
    if (user.provider && user.provider == 'github') {
        return 'github_' + user.id;
    }
    return null;
}

function GetUserName(user: any) : string {
    if (user.provider && user.provider ==  'github') {
        return user.username;
    }
    return null;
}

export var login = function(req: any, res: any) {
    var user: any = req.user;
    var UserId = GetUserId(user);
    var UserName = GetUserName(user);
    var Referer = req.header('Referer');
    if(Referer == null) {
        Referer = CONFIG.assurenote.basepath+'/';
    }

    var con = new db.Database();
    var userDAO = new model_user.UserDAO(con);
    userDAO.login(UserId, UserName, UserId, (err:any, result: model_user.User) => {
        if (err) {
            // TODO: display error information
            console.error(err);
            res.redirect(CONFIG.assurenote.basepath+'/');
            return;
        }
        var auth = new util_auth.Auth(req, res);
        auth.set(UserId, UserName);
        res.redirect(Referer);
    });
}

export var logout = function(req: any, res: any) {
    var auth = new util_auth.Auth(req, res);
    auth.clear();
    req.logout();
    res.redirect(CONFIG.assurenote.basepath+'/');
};

(() => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    if (CONFIG.passport.TWITTER_CONSUMER_KEY == '') return;

    passport.use(new TwitterStrategy({
        consumerKey: CONFIG.passport.TWITTER_CONSUMER_KEY,
        consumerSecret: CONFIG.passport.TWITTER_CONSUMER_SECRET,
        callbackURL: CONFIG.passport.resolveURL + "/auth    witter/callback",
        },
        function(token, tokenSecret, profile, done) {
            passport.session.accessToken = token;
            passport.session.profile = profile;
            process.nextTick(function () {
                return done(null, profile);
            });
        }
    ));
})();

(() => {
    if (CONFIG.passport.FACEBOOK_APP_ID == '') return;
    
    passport.use(new FacebookStrategy({
        clientID: CONFIG.passport.FACEBOOK_APP_ID,
        clientSecret: CONFIG.passport.FACEBOOK_APP_SECRET,
        callbackURL: CONFIG.passport.resolveURL + "/auth/facebook/callback",
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                done(null, profile);
            });
        })
    );
})();

(() => {
    if (CONFIG.passport.GITHUB_CLIENT_ID == '') return;

    passport.use(new GitHubStrategy({
            clientID: CONFIG.passport.GITHUB_CLIENT_ID,
            clientSecret: CONFIG.passport.GITHUB_CLIENT_SECRET,
            callbackURL: CONFIG.passport.resolveURL + "/auth/github/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                return done(null, profile);
            });
        }
    ));
})();

exports.passport = passport;
