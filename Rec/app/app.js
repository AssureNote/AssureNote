var express = require('express');
var routes = require('./routes/index');
var user = require('./routes/user');
var api = require('./routes/api');
var http = require('http');
var path = require('path');

exports.app = express();

exports.app.set('port', process.env.PORT || 3001);
exports.app.set('views', __dirname + '/views');
exports.app.set('view engine', 'jade');
exports.app.use(express.favicon());
exports.app.use(express.logger('dev'));
exports.app.use(express.bodyParser());
exports.app.use(express.methodOverride());
exports.app.use(exports.app.router);
exports.app.use(express.static(path.join(__dirname, 'public')));

if ('development' == exports.app.get('env')) {
    exports.app.use(express.errorHandler());
}

exports.app.get('/', routes.index);
exports.app.get('/users', user.list);
exports.app.post('/api/3.0', api.httpHandler);

http.createServer(exports.app).listen(exports.app.get('port'), function () {
    console.log('Express server listening on port ' + exports.app.get('port'));
});

