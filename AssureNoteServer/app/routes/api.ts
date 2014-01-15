var jsonrpc = require('../api/jsonrpc')
import type    = require('../api/type')
var assurance_case   = require('../api/assurance_case')

jsonrpc.add('version', function(params: any, userId: number, callback: type.Callback) {
	callback.onSuccess('version 1.0');
});

jsonrpc.addModule(assurance_case);
jsonrpc.requireAuth(['upload']);

export var httpHandler = jsonrpc.httpHandler;
