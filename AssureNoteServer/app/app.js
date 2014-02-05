///<reference path='DefinitelyTyped/node/node.d.ts'/>
///<reference path='DefinitelyTyped/express/express.d.ts'/>
var express = require('express');
var api = require('./routes/api');
var js = require('./routes/javascript');
var path = require('path');
var http = require('http');
var client = require('./routes/index');
var passport = require('./routes/passport');
var constant = require('./constant');
var CONFIG = require('config');

var app = exports.app = express();

// all environments
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser(CONFIG.cookie.secret));
    app.use(express.methodOverride());
    app.use(express.session());
    app.use(express.compress());
    app.use(passport.passport.initialize());
    app.use(passport.passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '../../AssureNote')));

    app.use(express.logger('dev'));
});

// development only
app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// production only
app.configure('production', function () {
    app.use(express.errorHandler());
});

app.post('/api/1.0', api.httpHandler);
app.get('/', client.index);
app.get('/file/:id', client.index);
app.get('/javascripts/config.js', js.config);

app.get('/auth/twitter', passport.passport.authenticate('twitter'), function (req, res) {
});
app.get('/auth/twitter/callback', passport.passport.authenticate('twitter', { failureRedirect: '/' }), passport.login);

app.get('/auth/facebook', passport.passport.authenticate('facebook'), function (req, res) {
});

app.get('/auth/facebook/callback', passport.passport.authenticate('facebook', { failureRedirect: '/' }), passport.login);

app.get('/auth/github', passport.passport.authenticate('github'), function (req, res) {
});

app.get('/auth/github/callback', passport.passport.authenticate('github', { failureRedirect: '/' }), passport.login);

app.get('/logout', passport.logout);

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}
