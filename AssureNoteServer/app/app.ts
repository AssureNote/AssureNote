///<reference path='DefinitelyTyped/node/node.d.ts'/>
///<reference path='DefinitelyTyped/express/express.d.ts'/>

var http       = require('http');
import express = require('express');
import api        = require('./routes/api');
var client     = require('./routes/index');
import js         = require('./routes/javascript');
var passport   = require('./routes/passport');
import path       = require('path');
var constant   = require('./constant');
var CONFIG = require('config');

var app = exports.app = express();

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	//var uploadDir = path.join(__dirname, CONFIG.ads.uploadPath);
	//console.log(uploadDir);
	//utilFs.mkdirpSync(uploadDir);
	//app.use(express.bodyParser({uploadDir: uploadDir}));
	app.use(express.bodyParser());
	app.use(express.cookieParser(CONFIG.cookie.secret));
//	app.use(express.cookieSession());
	app.use(express.methodOverride());
	app.use(express.session());
	app.use(passport.passport.initialize());
	app.use(passport.passport.session());
	// app.use(function(req, res, next) {
	//     console.log([
	//       req.headers['x-forwarded-for'] || req.client.remoteAddress,
	//       new Date().toLocaleString(),
	//       req.method,
	//       req.url,
	//       res.statusCode,
	//       req.headers.referer || '-',
	//       // req.headers['user-agent'] || '-'
	//       ].join('\t')
	//     );
	//     next();
	// });
	app.use(app.router);
	app.use(express.static(path.join(__dirname, '../../AssureNote')));

	app.use(express.logger('dev'));
})

// development only
app.configure('development', function() {
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// production only
app.configure('production', function() {
  app.use(express.errorHandler());
});

app.post('/api/1.0', api.httpHandler);
app.get('/', client.index);
app.get('/file/:id', client.index);
//app.get('/tag/:t', client.index);
//app.get('/new/:projectId', client.newcase);
//app.get('/project/new', client.newproject);
//app.get('/project/:id/edit', client.newproject);
//app.get('/case/:id', client.caseview);
//app.get('/case/:id/history', client.historyList);
//app.get('/case/:id/history/:history', client.history);
//app.post('/export.*', client.exporter);
//app.get('/case/:id/export/:type/node/:n', gts.exporter);
app.get('/javascripts/config.js', js.config);

app.get('/auth/twitter',
  passport.passport.authenticate('twitter'),
  function(req, res) {}
);
app.get('/auth/twitter/callback',
  passport.passport.authenticate('twitter', {failureRedirect: '/' }),
  passport.login
);

app.get('/auth/facebook',
  passport.passport.authenticate('facebook'),
  function(req, res) {}
);

app.get('/auth/facebook/callback',
  passport.passport.authenticate('facebook', { failureRedirect: '/' }),
  passport.login
);

app.get('/auth/github',
  passport.passport.authenticate('github'),
  function(req, res) {}
);

app.get('/auth/github/callback',
  passport.passport.authenticate('github', { failureRedirect: '/' }),
  passport.login
);

app.get('/logout',
  passport.logout
);

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}
