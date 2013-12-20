import jsonrpc = module('../api/jsonrpc')
import type = module('../api/type')
import assurenote = module('../api/assurenote')

jsonrpc.add('version', function(params: any, callback: type.Callback) {
	callback.onSuccess('version 3.0');
});

jsonrpc.addModule(assurenote);

export var httpHandler = jsonrpc.httpHandler;
