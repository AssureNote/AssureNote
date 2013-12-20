///<reference path='d.ts/DefinitelyTyped/node/node.d.ts'/>
///<reference path='d.ts/DefinitelyTyped/express/express.d.ts'/>

import express = module('express');
import routes = module('./routes/index');
import user = module('./routes/user');
import api = module('./routes/api');
import http = module('http');
import path = module('path');

export var app = <express.Express>express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/api/3.0', api.httpHandler);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
