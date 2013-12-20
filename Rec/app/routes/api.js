var jsonrpc = require('../api/jsonrpc');

var assurenote = require('../api/assurenote');

jsonrpc.add('version', function (params, callback) {
    callback.onSuccess('version 3.0');
});

jsonrpc.addModule(assurenote);

exports.httpHandler = jsonrpc.httpHandler;

