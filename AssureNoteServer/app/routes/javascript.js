///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var CONFIG = require('config');

//import ex = module('./exporter')
exports.config = function (req, res) {
    var params = { basepath: CONFIG.ads.basePath };
    res.set('Content-type', 'text/javascript');
    res.render('javascript/config', params);
};
