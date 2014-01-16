var jsonrpc = require('../api/jsonrpc');

var assurance_case = require('../api/assurance_case');

jsonrpc.add('version', function (params, userId, callback) {
    callback.onSuccess('version 1.0');
});

jsonrpc.addModule(assurance_case);
jsonrpc.requireAuth(['upload']);

exports.httpHandler = jsonrpc.httpHandler;
