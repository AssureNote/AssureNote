///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var CONFIG = require('config')

export var config = function(req: any, res: any) {
	var params = {basepath: CONFIG.assurenote.basepath};
	res.set('Content-type','text/javascript');
	res.render('javascript/config', params);
};
